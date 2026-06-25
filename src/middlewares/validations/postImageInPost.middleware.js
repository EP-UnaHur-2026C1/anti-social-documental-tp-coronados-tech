const HTTP = require("../../config/HttpCode");
const { PostImage } = require("../../models");

const postImageInPostMiddleware = async (req, res, next) => {
  const postId = req.params.id;
  const imageId = req.params.image_id;

  const postImage = await PostImage.findOne({ _id: imageId, post_id: postId });
  if (!postImage) {
    return res.status(HTTP.NOT_FOUND).json({
      message: res.__("post_image_not_in_post", { imageId, postId }),
    });
  }

  next();
};

module.exports = postImageInPostMiddleware;
