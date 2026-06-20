const { User } = require("../models");

const userSummarySelect = "nickname name lastName";

const getFollowers = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  return User.find({ following: userId }).select(userSummarySelect);
};

const getFollowing = async (userId) => {
  const user = await User.findById(userId).populate({
    path: "following",
    select: userSummarySelect,
  });
  if (!user) return null;
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

  if (!following || !follower) return null;

  if (!follower.following.some((id) => id.toString() === followingId.toString())) {
    follower.following.push(following._id);
    await follower.save();
  }

  return { following, follower };
};

const unfollow = async (followingId, followerId) => {
  const [following, follower] = await Promise.all([
    User.findById(followingId),
    User.findById(followerId),
  ]);

  if (!following || !follower) return null;

  follower.following = follower.following.filter(
    (id) => id.toString() !== followingId.toString(),
  );
  await follower.save();
  return true;
};

module.exports = {
  getFollowers,
  getFollowing,
  follow,
  unfollow,
};
