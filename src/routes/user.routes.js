const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");
const { userSchema, updateUserSchema } = require("../schemas/user.schema");
const { User } = require("../models");
const schemaValidatorMiddleware = require("../middlewares/validations/schema.middleware");
const existValidateMiddleware = require("../middlewares/validations/exist.middleware");
const objectIdParamValidateMiddleware = require("../middlewares/validations/objectId.middleware");

router.get("/", getAllUsers);

router.post("/", schemaValidatorMiddleware(userSchema), createUser);

router.get(
  "/:id",
  objectIdParamValidateMiddleware("id"),
  existValidateMiddleware(User, "id"),
  getUserById,
);

router.put(
  "/:id",
  objectIdParamValidateMiddleware("id"),
  existValidateMiddleware(User, "id"),
  schemaValidatorMiddleware(updateUserSchema),
  updateUser,
);

router.delete(
  "/:id",
  objectIdParamValidateMiddleware("id"),
  existValidateMiddleware(User, "id"),
  deleteUser,
);

module.exports = router;
