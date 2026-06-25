const express = require("express");
const router = express.Router();
const { Post, User, PostImage } = require("../models");
const filterPostCommentsMiddleware = require("../middlewares/filterPostComments.middleware");

const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../controllers/post.controller");

const {
  getPostImagesByPost,
  createPostImage,
  updatePostImage,
  deletePostImage,
} = require("../controllers/postImage.controller");

const schemaValidatorMiddleware = require("../middlewares/validations/schema.middleware");
const querySchemaValidatorMiddleware =
  require("../middlewares/validations/schema.middleware").querySchemaValidatorMiddleware;
const existValidateMiddleware = require("../middlewares/validations/exist.middleware");
const objectIdParamValidateMiddleware = require("../middlewares/validations/objectId.middleware");
const requireImageMiddleware = require("../middlewares/validations/requireImage.middleware");
const postImageInPostMiddleware = require("../middlewares/validations/postImageInPost.middleware");

const { uploadSingleImage } = require("../middlewares/upload.middleware");
const {
  postSchema,
  updatePostSchema,
  getAllPostsQuerySchema,
} = require("../schemas/post.schema");
const { updatePostImageSchema } = require("../schemas/postImage.schema");

router.get(
  "/",
  querySchemaValidatorMiddleware(getAllPostsQuerySchema),
  existValidateMiddleware(User, "user_id", { optional: true }),
  filterPostCommentsMiddleware,
  getAllPosts,
);

router.post(
  "/",
  schemaValidatorMiddleware(postSchema),
  existValidateMiddleware(User, "user_id"),
  createPost,
);

router.get(
  "/:id/images",
  objectIdParamValidateMiddleware("id"),
  existValidateMiddleware(Post, "id"),
  getPostImagesByPost,
);

router.post(
  "/:id/images",
  objectIdParamValidateMiddleware("id"),
  existValidateMiddleware(Post, "id"),
  uploadSingleImage,
  requireImageMiddleware,
  createPostImage,
);

router.patch(
  "/:id/images/:image_id",
  objectIdParamValidateMiddleware("id"),
  objectIdParamValidateMiddleware("image_id"),
  existValidateMiddleware(Post, "id"),
  existValidateMiddleware(PostImage, "image_id"),
  postImageInPostMiddleware,
  uploadSingleImage,
  schemaValidatorMiddleware(updatePostImageSchema),
  existValidateMiddleware(Post, "post_id", { optional: true, aliases: ["postId"] }),
  updatePostImage,
);

router.delete(
  "/:id/images/:image_id",
  objectIdParamValidateMiddleware("id"),
  objectIdParamValidateMiddleware("image_id"),
  existValidateMiddleware(Post, "id"),
  existValidateMiddleware(PostImage, "image_id"),
  postImageInPostMiddleware,
  deletePostImage,
);

router.get(
  "/:id",
  objectIdParamValidateMiddleware("id"),
  existValidateMiddleware(Post, "id"),
  getPostById,
);

router.patch(
  "/:id",
  objectIdParamValidateMiddleware("id"),
  existValidateMiddleware(Post, "id"),
  schemaValidatorMiddleware(updatePostSchema),
  updatePost,
);

router.delete(
  "/:id",
  objectIdParamValidateMiddleware("id"),
  existValidateMiddleware(Post, "id"),
  deletePost,
);

module.exports = router;
