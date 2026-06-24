const { Comment } = require("../models");
const postCache = require("./postCache.service");

const serializeCommentForPostCache = async (comment) => {
    await comment.populate("user_id", "nickname name lastName");
    return comment.toObject();
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
    if (!comment) return null;

    comment.content = content;
    await comment.save();

    const serialized = await serializeCommentForPostCache(comment);
    await postCache.updateComment(comment.post_id, id, serialized);

    return comment.populate("user_id", "nickname name lastName");
};

const remove = async (id) => {
    const comment = await Comment.findById(id);
    if (!comment) return false;

    const postId = comment.post_id;
    await comment.deleteOne();
    await postCache.removeComment(postId, id);
    return true;
};

module.exports = {
    create,
    findById,
    update,
    remove,
};
