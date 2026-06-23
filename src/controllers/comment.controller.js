const commentService = require("../services/comment.service");

const createComment = async (req, res, next) => {
    try {
        const { content, post_id } = req.body;
        const user_id = req.user?._id || req.body.user_id; 

        const comment = await commentService.create({ content, user_id, post_id });
        return res.status(201).json({ success: true, data: comment });
    } catch (error) {
        next(error);
    }
};

const updateComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        const comment = await commentService.update(id, { content });
        if (!comment) {
            return res.status(404).json({ success: false, message: "Comentario no encontrado" });
        }

        return res.status(200).json({ success: true, data: comment });
    } catch (error) {
        next(error);
    }
};

const deleteComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await commentService.remove(id);
        
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Comentario no encontrado" });
        }

        return res.status(200).json({ success: true, message: "Comentario eliminado correctamente" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createComment,
    updateComment,
    deleteComment,
};