const Joi = require("joi");
const { objectIdField } = require("./helpers/objectIdField");

const updatePostImageSchema = Joi.object({
  postId: objectIdField("postId").optional(),
  post_id: objectIdField("post_id").optional(),
}).unknown(true);

module.exports = { updatePostImageSchema };
