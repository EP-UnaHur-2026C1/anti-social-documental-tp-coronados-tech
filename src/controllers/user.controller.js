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

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
