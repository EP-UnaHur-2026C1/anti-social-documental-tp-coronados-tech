const Joi = require("joi");
const { objectIdField } = require("./helpers/objectIdField");

const followSchema = Joi.object({
  follower_id: objectIdField("follower_id").required(),
});

module.exports = { followSchema };
