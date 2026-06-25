const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserFollowers,
  getUserFollowing,
  followUser,
  unfollowUser,
} = require("../controllers/user.controller");
const { userSchema, updateUserSchema } = require("../schemas/user.schema");
const { followSchema } = require("../schemas/follower.schema");
const { User } = require("../models");
const schemaValidatorMiddleware = require("../middlewares/validations/schema.middleware");
const existValidateMiddleware = require("../middlewares/validations/exist.middleware");
const uniqueValidateMiddleware =
  require("../middlewares/validations/exist.middleware").uniqueValidateMiddleware;
const objectIdParamValidateMiddleware = require("../middlewares/validations/objectId.middleware");
const alreadyFollowingMiddleware = require("../middlewares/validations/alreadyFollowing.middleware");
const notFollowingMiddleware = require("../middlewares/validations/notFollowing.middleware");

router.get("/", getAllUsers);

router.post(
  "/",
  schemaValidatorMiddleware(userSchema),
  uniqueValidateMiddleware(User, "email", {
    normalize: (value) => value.trim().toLowerCase(),
  }),
  uniqueValidateMiddleware(User, "nickname", {
    normalize: (value) => value.trim(),
  }),
  createUser,
);

router.get(
  "/:id",
  objectIdParamValidateMiddleware("id"),
  existValidateMiddleware(User, "id"),
  getUserById,
);
router.get(
  "/:id/followers",
  objectIdParamValidateMiddleware("id"),
  existValidateMiddleware(User, "id"),
  getUserFollowers,
);

router.get(
  "/:id/following",
  objectIdParamValidateMiddleware("id"),
  existValidateMiddleware(User, "id"),
  getUserFollowing,
);

router.post(
  "/:id/follow",
  objectIdParamValidateMiddleware("id"),
  existValidateMiddleware(User, "id"),
  schemaValidatorMiddleware(followSchema),
  existValidateMiddleware(User, "follower_id"),
  alreadyFollowingMiddleware,
  followUser,
);

router.delete(
  "/:id/follow/:follower_id",
  objectIdParamValidateMiddleware("id"),
  objectIdParamValidateMiddleware("follower_id"),
  existValidateMiddleware(User, "id"),
  existValidateMiddleware(User, "follower_id"),
  notFollowingMiddleware,
  unfollowUser,
);

router.put(
  "/:id",
  objectIdParamValidateMiddleware("id"),
  existValidateMiddleware(User, "id"),
  schemaValidatorMiddleware(updateUserSchema),
  uniqueValidateMiddleware(User, "email", {
    normalize: (value) => value.trim().toLowerCase(),
    excludeParam: "id",
  }),
  uniqueValidateMiddleware(User, "nickname", {
    normalize: (value) => value.trim(),
    excludeParam: "id",
  }),
  updateUser,
);

router.delete(
  "/:id",
  objectIdParamValidateMiddleware("id"),
  existValidateMiddleware(User, "id"),
  deleteUser,
);

module.exports = router;
