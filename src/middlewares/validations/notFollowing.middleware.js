const HTTP = require("../../config/HttpCode");
const { User } = require("../../models");
const { sendValidationError } = require("../../helpers/validationError");

const notFollowingMiddleware = async (req, res, next) => {
  const followingId = req.params.id;
  const followerId = req.params.follower_id;

  const follower = await User.findById(followerId);
  const isFollowing = follower?.following?.some(
    (id) => id.toString() === followingId.toString(),
  );

  if (!isFollowing) {
    return sendValidationError(
      res,
      HTTP.CONFLICT,
      "follower_id",
      res.__("not_following"),
    );
  }

  next();
};

module.exports = notFollowingMiddleware;
