const HTTP = require("../config/HttpCode");
const postImageService = require("../services/postImage.service");

const createPostImage = async (req, res) => {
  const postId = req.params.id;
  const image = await postImageService.create({
    filename: req.file.filename,
    path: req.file.path,
    postId,
  });
  res.status(HTTP.CREATED).json(image);
};

const getPostImagesByPost = async (req, res) => {
  const postId = req.params.id;
  const images = await postImageService.findByPostId(postId);
  res.status(HTTP.OK).json(images);
};

const updatePostImage = async (req, res) => {
  const postId = req.params.id;
  const imageId = req.params.image_id;

  const postImage = await postImageService.update(imageId, {
    postId,
    filename: req.file?.filename,
    path: req.file?.path,
    newPostId: req.body?.postId ?? req.body?.post_id,
  });

  res.status(HTTP.OK).json(postImage);
};

const deletePostImage = async (req, res) => {
  const postId = req.params.id;
  const imageId = req.params.image_id;

  await postImageService.remove(imageId, { postId });

  res.status(HTTP.OK).json({
    message: res.__("delete_post_image_from_post", { imageId, postId }),
  });
};

const uploadImage = async (req, res) => {
  const { post_id } = req.body;
  const image = await postImageService.create({
    filename: req.file.filename,
    path: req.file.path,
    post_id,
  });
  res.status(HTTP.CREATED).json(image);
};

module.exports = {
  uploadImage,
  createPostImage,
  getPostImagesByPost,
  updatePostImage,
  deletePostImage,
};
