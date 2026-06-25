const express = require("express");
const router = express.Router();
const { Post } = require("../models");
const postImageController = require("../controllers/postImage.controller");
const schemaValidatorMiddleware = require("../middlewares/validations/schema.middleware");
const existValidateMiddleware = require("../middlewares/validations/exist.middleware");
const requireImageMiddleware = require("../middlewares/validations/requireImage.middleware");
const { uploadSingleImage } = require("../middlewares/upload.middleware");
const { createPostImageSchema } = require("../schemas/postImage.schema");

router.post(
  "/",
  uploadSingleImage,
  requireImageMiddleware,
  schemaValidatorMiddleware(createPostImageSchema),
  existValidateMiddleware(Post, "post_id"),
  postImageController.uploadImage,
);

module.exports = router;
