const { Post, PostImage, Comment, Tag } = require("../models");
const { normalizeTagName } = require("../helpers/normalizeTagName");
const { removeAllByPostId } = require("./postImage.service");
const postCache = require("./postCache.service");
const { emitPostEvent, POST_EVENTS } = require("../events/postEvents");

const listCacheKey = (user_id) => (user_id !== undefined ? `posts:user:${user_id}` : "posts:all");

const resolveTags = async (tagNames = []) => {
    const tagInstances = [];

    for (const tagName of tagNames) {
        const normalized = normalizeTagName(tagName);
        let tag = await Tag.findOne({ name: normalized });
        if (!tag) {
            tag = await Tag.create({ name: normalized });
        }
        tagInstances.push(tag._id);
    }

    return tagInstances;
};

const enrichPost = async (post) => {
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
    const cached = await postCache.get(cacheKey);
    if (cached) return cached;

    const filter = user_id ? { user_id } : {};
    const posts = await Post.find(filter);
    const serialized = await Promise.all(posts.map(enrichPost));

    await postCache.set(cacheKey, serialized);
    return serialized;
};

const findById = async (id) => {
    const cacheKey = `post:${id}`;
    const cached = await postCache.get(cacheKey);
    if (cached) return cached;

    const post = await Post.findById(id);
    const serialized = await enrichPost(post);
    await postCache.set(cacheKey, serialized);
    return serialized;
};

const create = async ({ description, user_id, tags }) => {
    const tagIds = tags?.length ? await resolveTags(tags) : [];
    const post = await Post.create({ description, user_id, tags: tagIds });

    const serialized = await findById(post._id);
    await emitPostEvent(POST_EVENTS.POST_ADDED_TO_LISTS, { post: serialized });
    return serialized;
};

const update = async (id, { description, tags }) => {
    const post = await Post.findById(id);

    if (description !== undefined) {
        post.description = description;
    }

    if (tags !== undefined) {
        post.tags = await resolveTags(tags);
    }

    await post.save();

    const fields = {};
    if (description !== undefined) {
        fields.description = description;
    }
    if (tags !== undefined) {
        fields.tags = post.tags?.length
            ? (await Tag.find({ _id: { $in: post.tags } }).select("name")).map((tag) => tag.toJSON())
            : [];
    }
    await emitPostEvent(POST_EVENTS.POST_FIELDS_UPDATED, { postId: id, fields });

    return findById(id);
};

const remove = async (id) => {
    const post = await Post.findById(id);

    await Comment.deleteMany({ post_id: id });
    await removeAllByPostId(id);
    await post.deleteOne();
    await emitPostEvent(POST_EVENTS.POST_REMOVED, { postId: id });
};

module.exports = {
    findAll,
    findById,
    create,
    update,
    remove,
};
