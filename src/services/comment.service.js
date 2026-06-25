const { Comment } = require("../models");
const postCache = require("./postCache.service");

const serializeCommentForPostCache = async (comment) => {
    await comment.populate("user_id", "nickname name lastName");
    return comment.toObject();
};

const findAll = async ({ post_id } = {}) => {
    const filter = post_id ? { post_id } : {};
    return await Comment.find(filter).populate("user_id", "nickname name lastName");
};

const create = async ({ content, user_id, post_id }) => {
    const comment = await Comment.create({ content, user_id, post_id });
    const serialized = await serializeCommentForPostCache(comment);
    await postCache.addComment(post_id, serialized);
    return comment.populate("user_id", "nickname name lastName");
};

const findById = async (id) => {
    return await Comment.findById(id).populate("user_id", "nickname name lastName");
};

const update = async (id, { content }) => {
    const comment = await Comment.findById(id);
    comment.content = content;
    await comment.save();

    const serialized = await serializeCommentForPostCache(comment);
    await postCache.updateComment(comment.post_id, id, serialized);

    return comment.populate("user_id", "nickname name lastName");
};

const remove = async (id) => {
    const comment = await Comment.findById(id);
    const postId = comment.post_id;
    await comment.deleteOne();
    await postCache.removeComment(postId, id);
};

module.exports = {
    findAll,
    findById,
    create,
    update,
    remove,
};
