const Joi = require("joi");
const { objectIdField } = require("./helpers/objectIdField");

const postIdField = objectIdField("post_id");

const createPostImageSchema = Joi.object({
  post_id: postIdField.required(),
}).unknown(true);

const updatePostImageSchema = Joi.object({
  postId: objectIdField("postId").optional(),
  post_id: postIdField.optional(),
}).unknown(true);

module.exports = { createPostImageSchema, updatePostImageSchema };
