const HTTP = require("../../config/HttpCode");

const requireImageMiddleware = (req, res, next) => {
  if (!req.file) {
    return res.status(HTTP.BAD_REQUEST).json({
      message: res.__("no_image_sent"),
    });
  }
  next();
};

module.exports = requireImageMiddleware;
