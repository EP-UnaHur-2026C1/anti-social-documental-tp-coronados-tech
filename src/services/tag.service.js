const { Tag, Post } = require("../models");
const postCache = require("./postCache.service");

const normalizeName = (name) => name.trim().toLowerCase();

const attachPosts = async (tags) => {
    const result = [];

    for (const tag of tags) {
        const json = tag.toJSON();
        json.posts = await Post.find({ tags: tag._id }).select("description");
        result.push(json);
    }

    return result;
};

const invalidateCacheForPosts = async (posts = []) => {
    for (const post of posts) {
        postCache.deletePost(post.id ?? post._id);
    }
};

const findAll = async ({ post_id } = {}) => {
    if (post_id !== undefined) {
        const post = await Post.findById(post_id).populate("tags");
        return post?.tags?.map((tag) => tag.toJSON()) ?? [];
    }

    const tags = await Tag.find();
    return attachPosts(tags);
};

const findById = async (id) => {
    const tag = await Tag.findById(id);
    if (!tag) return null;

    const [enriched] = await attachPosts([tag]);
    return enriched;
};

const create = async ({ name, post_id }) => {
    const normalized = normalizeName(name);
    let tag = await Tag.findOne({ name: normalized });
    let created = false;

    if (!tag) {
        tag = await Tag.create({ name: normalized });
        created = true;
    }

    if (post_id !== undefined) {
        const post = await Post.findById(post_id);
        if (post && !post.tags.some((tagId) => tagId.toString() === tag._id.toString())) {
            post.tags.push(tag._id);
            await post.save();
        }
        postCache.deletePost(post_id);
    }

    return { tag: await findById(tag._id), created };
};

const update = async (id, { name }) => {
    const tag = await Tag.findById(id);
    if (!tag) return null;
    if (name === undefined) return { empty: true };

    const posts = await Post.find({ tags: id }).select("_id");
    tag.name = normalizeName(name);
    await tag.save();
    await invalidateCacheForPosts(posts);

    return findById(id);
};

const remove = async (id) => {
    const tag = await Tag.findById(id);
    if (!tag) return false;

    const posts = await Post.find({ tags: id });
    await Post.updateMany({ tags: id }, { $pull: { tags: id } });
    await tag.deleteOne();
    await invalidateCacheForPosts(posts);
    return true;
};

module.exports = {
    findAll,
    findById,
    create,
    update,
    remove,
};
