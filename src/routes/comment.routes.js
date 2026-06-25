const express = require("express");
const router = express.Router();
const { User, Post, Comment } = require("../models");
const {
  getAllComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/comment.controller");
const schemaValidatorMiddleware = require("../middlewares/validations/schema.middleware");
const querySchemaValidatorMiddleware =
  require("../middlewares/validations/schema.middleware").querySchemaValidatorMiddleware;
const existValidateMiddleware = require("../middlewares/validations/exist.middleware");
const objectIdParamValidateMiddleware = require("../middlewares/validations/objectId.middleware");
const {
  commentSchema,
  updateCommentSchema,
  getAllCommentsQuerySchema,
} = require("../schemas/comment.schema");

router.get(
  "/",
  querySchemaValidatorMiddleware(getAllCommentsQuerySchema),
  existValidateMiddleware(Post, "post_id", { optional: true }),
  getAllComments,
);

router.post(
  "/",
  schemaValidatorMiddleware(commentSchema),
  existValidateMiddleware(User, "user_id"),
  existValidateMiddleware(Post, "post_id"),
  createComment,
);

router.get(
  "/:id",
  objectIdParamValidateMiddleware("id"),
  existValidateMiddleware(Comment, "id"),
  getCommentById,
);

router.patch(
  "/:id",
  objectIdParamValidateMiddleware("id"),
  existValidateMiddleware(Comment, "id"),
  schemaValidatorMiddleware(updateCommentSchema),
  updateComment,
);

router.delete(
  "/:id",
  objectIdParamValidateMiddleware("id"),
  existValidateMiddleware(Comment, "id"),
  deleteComment,
);

module.exports = router;
