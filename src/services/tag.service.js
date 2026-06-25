const { Tag, Post } = require("../models");
const { normalizeTagName } = require("../helpers/normalizeTagName");
const { emitPostEvent, POST_EVENTS } = require("../events/postEvents");

const attachPosts = async (tags) => {
    const result = [];

    for (const tag of tags) {
        const json = tag.toJSON();
        json.posts = await Post.find({ tags: tag._id }).select("description");
        result.push(json);
    }

    return result;
};

const refreshTagsInCache = async (posts = []) => {
    for (const post of posts) {
        const id = post.id ?? post._id;
        const fullPost = await Post.findById(id).populate("tags", "name");
        if (!fullPost) continue;

        const tags = fullPost.tags?.map((tag) => tag.toJSON()) ?? [];
        await emitPostEvent(POST_EVENTS.POST_FIELDS_UPDATED, { postId: id, fields: { tags } });
    }
};

const findAll = async ({ post_id } = {}) => {
    if (post_id !== undefined) {
        const post = await Post.findById(post_id).populate("tags");
        return post.tags.map((tag) => tag.toJSON());
    }

    const tags = await Tag.find();
    return attachPosts(tags);
};

const findById = async (id) => {
    const tag = await Tag.findById(id);
    const [enriched] = await attachPosts([tag]);
    return enriched;
};

const create = async ({ name, post_id }) => {
    const normalized = normalizeTagName(name);
    const tag = await Tag.create({ name: normalized });

    if (post_id !== undefined) {
        const post = await Post.findById(post_id);
        if (!post.tags.some((tagId) => tagId.toString() === tag._id.toString())) {
            post.tags.push(tag._id);
            await post.save();
        }

        await emitPostEvent(POST_EVENTS.TAG_ADDED_TO_POST, {
            postId: post_id,
            tag: tag.toObject(),
        });
    }

    return findById(tag._id);
};

const update = async (id, { name }) => {
    const tag = await Tag.findById(id);

    const posts = await Post.find({ tags: id }).select("_id");
    tag.name = normalizeTagName(name);
    await tag.save();
    await refreshTagsInCache(posts);

    return findById(id);
};

const remove = async (id) => {
    const tag = await Tag.findById(id);

    const posts = await Post.find({ tags: id });
    await Post.updateMany({ tags: id }, { $pull: { tags: id } });
    await tag.deleteOne();
    await refreshTagsInCache(posts);
};

module.exports = {
    findAll,
    findById,
    create,
    update,
    remove,
};
