const postImageService = require("../services/postImage.service");

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
};