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

const refreshTagsInCache = async (posts = []) => {
    for (const post of posts) {
        const id = post.id ?? post._id;
        const fullPost = await Post.findById(id).populate("tags", "name");
        if (!fullPost) continue;

        const tags = fullPost.tags?.map((tag) => tag.toJSON()) ?? [];
        await postCache.updatePostFields(id, { tags });
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

        await postCache.mutatePost(post_id, (cached) => {
            if (!Array.isArray(cached.tags)) {
                cached.tags = [];
            }
            const exists = cached.tags.some((item) => String(item._id ?? item.id) === String(tag._id));
            if (!exists) {
                cached.tags.push(tag.toObject());
            }
        });
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
    await refreshTagsInCache(posts);

    return findById(id);
};

const remove = async (id) => {
    const tag = await Tag.findById(id);
    if (!tag) return false;

    const posts = await Post.find({ tags: id });
    await Post.updateMany({ tags: id }, { $pull: { tags: id } });
    await tag.deleteOne();
    await refreshTagsInCache(posts);
    return true;
};

module.exports = {
    findAll,
    findById,
    create,
    update,
    remove,
};
