const HTTP = require("../config/HttpCode");
const { User } = require("../models");
const followerService = require("../services/follower.service");

const createUser = async (req, res) => {
  const user = await User.create(req.body);
  res.status(HTTP.CREATED).json(user);
};

const getAllUsers = async (req, res) => {
  const users = await User.find();
  res.status(HTTP.OK).json(users);
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  res.status(HTTP.OK).json(user);
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  Object.assign(user, req.body);
  await user.save();
  res.status(HTTP.OK).json(user);
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  res.status(HTTP.OK).json({ message: res.__("delete_user", { id }) });
};

const getUserFollowers = async (req, res) => {
  const { id } = req.params;
  const followers = await followerService.getFollowers(id);
  res.status(HTTP.OK).json(followers);
};

const getUserFollowing = async (req, res) => {
  const { id } = req.params;
  const following = await followerService.getFollowing(id);
  res.status(HTTP.OK).json(following);
};

const followUser = async (req, res) => {
  const { id } = req.params;
  const { follower_id } = req.body;
  const result = await followerService.follow(id, follower_id);

  if (result?.selfFollow) {
    return res.status(HTTP.BAD_REQUEST).json({
      message: res.__("cannot_follow_self"),
    });
  }

  res.status(HTTP.CREATED).json({
    message: res.__("follow_success"),
    following_id: id,
    follower_id,
  });
};

const unfollowUser = async (req, res) => {
  const { id, follower_id } = req.params;
  await followerService.unfollow(id, follower_id);

  res.status(HTTP.OK).json({
    message: res.__("unfollow_success"),
    following_id: id,
    follower_id,
  });
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserFollowers,
  getUserFollowing,
  followUser,
  unfollowUser,
};
