const { Comment } = require("../models");
const postCache = require("./postCache.service");

const create = async ({ content, user_id, post_id }) => {
    const comment = await Comment.create({ content, user_id, post_id });
    // Al agregar un comentario, limpiamos la cache de posts para que se renderice el nuevo
    postCache.deletePost(post_id); 
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

    postCache.deletePost(comment.post_id);
    return comment.populate("user_id", "nickname name lastName");
};

const remove = async (id) => {
    const comment = await Comment.findById(id);
    if (!comment) return false;

    const postId = comment.post_id;
    await comment.deleteOne();
    
    postCache.deletePost(postId);
    return true;
};

module.exports = {
    create,
    findById,
    update,
    remove,
};