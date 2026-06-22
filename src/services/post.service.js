const { Post, User, PostImage, Comment, Tag } = require("../models");
const { removeAllByPostId } = require("./postimage.service");
const postCache = require("./postCache.service");

const listCacheKey = (user_id) => (user_id !== undefined ? `posts:user:${user_id}` : "posts:all");

const normalizeName = (name) => name.trim().toLowerCase();

const resolveTags = async (tagNames = []) => {
    const tagInstances = [];

    for (const tagName of tagNames) {
        const normalized = normalizeName(tagName);
        let tag = await Tag.findOne({ name: normalized });
        if (!tag) {
            tag = await Tag.create({ name: normalized });
        }
        tagInstances.push(tag._id);
    }

    return tagInstances;
};

const attachRelations = async (posts) => {
    const enriched = [];

    for (const post of posts) {
        const json = post.toJSON();
        json.user = post.user_id?.toJSON ? post.user_id.toJSON() : post.user_id;
        delete json.user_id;

        json.postImages = await PostImage.find({ post_id: post._id });
        json.comments = await Comment.find({ post_id: post._id }).populate("user_id", "nickname name lastName");
        json.tags = post.tags?.length ? await Tag.find({ _id: { $in: post.tags } }).select("name") : [];

        enriched.push(json);
    }

    return enriched;
};

const serializePost = async (post) => {
    if (!post) return null;

    await post.populate([
        { path: "user_id", select: "nickname name lastName" },
        { path: "tags", select: "name" },
    ]);

    const json = post.toJSON();
    json.user = json.user_id;
    delete json.user_id;

    json.postImages = await PostImage.find({ post_id: post._id });
    json.comments = await Comment.find({ post_id: post._id }).populate("user_id", "nickname name lastName");

    return json;
};

const findAll = async ({ user_id } = {}) => {
    const cacheKey = listCacheKey(user_id);
    const cached = postCache.get(cacheKey);
    if (cached) return cached;

    const filter = user_id ? { user_id } : {};
    const posts = await Post.find(filter).populate([
        { path: "user_id", select: "nickname name lastName" },
        { path: "tags", select: "name" },
    ]);
    const serialized = await attachRelations(posts);

    postCache.set(cacheKey, serialized);
    return serialized;
};

const findById = async (id) => {
    const cacheKey = `post:${id}`;
    const cached = postCache.get(cacheKey);
    if (cached) return cached;

    const post = await Post.findById(id);
    if (!post) return null;

    const serialized = await serializePost(post);
    postCache.set(cacheKey, serialized);
    return serialized;
};

const create = async ({ description, user_id, tags }) => {
    const tagIds = tags?.length ? await resolveTags(tags) : [];
    const post = await Post.create({ description, user_id, tags: tagIds });

    postCache.deleteAll();
    return findById(post._id);
};

const update = async (id, { description, tags }) => {
    const post = await Post.findById(id);
    if (!post) return null;
    if (description === undefined && tags === undefined) return { empty: true };

    if (description !== undefined) {
        post.description = description;
    }

    if (tags !== undefined) {
        post.tags = await resolveTags(tags);
    }

    await post.save();
    postCache.deletePost(id);

    return findById(id);
};

const remove = async (id) => {
    const post = await Post.findById(id);
    if (!post) return false;

    await Comment.deleteMany({ post_id: id });
    await removeAllByPostId(id);
    await post.deleteOne();
    postCache.deletePost(id);
    return true;
};

module.exports = {
    findAll,
    findById,
    create,
    update,
    remove,
};
