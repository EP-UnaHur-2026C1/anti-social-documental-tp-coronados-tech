const HTTP = require("../config/HttpCode");
const postImageService = require("../services/postImage.service");

const respondServiceError = (res, result, { imageId, postId } = {}) => {
    if (!result?.status || result.status === "ok") return false;

    switch (result.status) {
        case "post_not_found":
            res.status(HTTP.NOT_FOUND).json({
                message: res.__("id_dont_exist", { id: postId, nombreModelo: "Post" }),
            });
            return true;
        case "image_not_found":
            res.status(HTTP.NOT_FOUND).json({
                message: res.__("post_image_not_in_post", { imageId, postId }),
            });
            return true;
        case "not_found":
            res.status(HTTP.NOT_FOUND).json({
                message: res.__("id_dont_exist", { id: imageId, nombreModelo: "PostImage" }),
            });
            return true;
        default:
            return false;
    }
};

const createPostImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(HTTP.BAD_REQUEST).json({
                message: res.__("no_image_sent"),
            });
        }

        const postId = req.params.id;
        const image = await postImageService.create({
            filename: req.file.filename,
            path: req.file.path,
            postId,
        });

        return res.status(HTTP.CREATED).json(image);
    } catch (error) {
        next(error);
    }
};

const getPostImagesByPost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const { images } = await postImageService.findByPostId(postId);
        return res.status(HTTP.OK).json(images);
    } catch (error) {
        next(error);
    }
};

const updatePostImage = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const imageId = req.params.image_id;

        const result = await postImageService.update(imageId, {
            postId,
            filename: req.file?.filename,
            path: req.file?.path,
            newPostId: req.body?.postId ?? req.body?.post_id,
        });

        if (respondServiceError(res, result, { imageId, postId })) return;

        return res.status(HTTP.OK).json(result.postImage);
    } catch (error) {
        next(error);
    }
};

const deletePostImage = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const imageId = req.params.image_id;

        const result = await postImageService.remove(imageId, { postId });
        if (respondServiceError(res, result, { imageId, postId })) return;

        return res.status(HTTP.OK).json({
            message: res.__("delete_post_image_from_post", { imageId, postId }),
        });
    } catch (error) {
        next(error);
    }
};

const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No se subió ninguna imagen" });
        }

        const { post_id } = req.body;
        if (!post_id) {
            if (req.file.path) require("fs").unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: "El campo post_id es obligatorio" });
        }

        const image = await postImageService.create({
            filename: req.file.filename,
            path: req.file.path,
            post_id,
        });

        return res.status(201).json({ success: true, data: image });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadImage,
    createPostImage,
    getPostImagesByPost,
    updatePostImage,
    deletePostImage,
};
