const express = require("express");
const router = express.Router();
const { Tag, Post } = require("../models");
const {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
} = require("../controllers/tag.controller");
const schemaValidatorMiddleware = require("../middlewares/validations/schema.middleware");
const querySchemaValidatorMiddleware =
  require("../middlewares/validations/schema.middleware").querySchemaValidatorMiddleware;
const existValidateMiddleware = require("../middlewares/validations/exist.middleware");
const uniqueValidateMiddleware =
  require("../middlewares/validations/exist.middleware").uniqueValidateMiddleware;
const objectIdParamValidateMiddleware = require("../middlewares/validations/objectId.middleware");
const {
  tagSchema,
  updateTagSchema,
  getAllTagsQuerySchema,
} = require("../schemas/tag.schema");

router.get(
  "/",
  querySchemaValidatorMiddleware(getAllTagsQuerySchema),
  existValidateMiddleware(Post, "post_id", { optional: true }),
  getAllTags,
);

const normalizeTagName = (value) => value.trim().toLowerCase();

router.post(
  "/",
  schemaValidatorMiddleware(tagSchema),
  uniqueValidateMiddleware(Tag, "name", { normalize: normalizeTagName }),
  existValidateMiddleware(Post, "post_id", { optional: true }),
  createTag,
);

router.get(
  "/:id",
  objectIdParamValidateMiddleware("id"),
  existValidateMiddleware(Tag, "id"),
  getTagById,
);

router.patch(
  "/:id",
  objectIdParamValidateMiddleware("id"),
  existValidateMiddleware(Tag, "id"),
  schemaValidatorMiddleware(updateTagSchema),
  uniqueValidateMiddleware(Tag, "name", {
    normalize: normalizeTagName,
    excludeParam: "id",
    optional: true,
  }),
  updateTag,
);

router.delete(
  "/:id",
  objectIdParamValidateMiddleware("id"),
  existValidateMiddleware(Tag, "id"),
  deleteTag,
);

module.exports = router;
