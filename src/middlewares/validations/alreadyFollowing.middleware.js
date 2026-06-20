const HTTP = require("../../config/HttpCode");
const { User } = require("../../models");

const alreadyFollowingMiddleware = async (req, res, next) => {
  const followingId = req.params.id;
  const followerId = req.body.follower_id;

  const follower = await User.findById(followerId);
  const alreadyFollowing = follower?.following?.some(
    (id) => id.toString() === followingId.toString(),
  );

  if (alreadyFollowing) {
    return res.status(HTTP.CONFLICT).json({
      message: res.__("already_following"),
    });
  }

  next();
};

module.exports = alreadyFollowingMiddleware;
