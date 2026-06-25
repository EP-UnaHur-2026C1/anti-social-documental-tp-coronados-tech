const { User } = require("../models");

const userSummarySelect = "nickname name lastName";

const getFollowers = async (userId) => {
  return User.find({ following: userId }).select(userSummarySelect);
};

const getFollowing = async (userId) => {
  const user = await User.findById(userId).populate({
    path: "following",
    select: userSummarySelect,
  });
  return user.following;
};

const follow = async (followingId, followerId) => {
  if (followingId.toString() === followerId.toString()) {
    return { selfFollow: true };
  }

  const [following, follower] = await Promise.all([
    User.findById(followingId),
    User.findById(followerId),
  ]);

  if (!follower.following.some((id) => id.toString() === followingId.toString())) {
    follower.following.push(following._id);
    await follower.save();
  }

  return { following, follower };
};

const unfollow = async (followingId, followerId) => {
  const follower = await User.findById(followerId);

  follower.following = follower.following.filter(
    (id) => id.toString() !== followingId.toString(),
  );
  await follower.save();
};

module.exports = {
  getFollowers,
  getFollowing,
  follow,
  unfollow,
};
