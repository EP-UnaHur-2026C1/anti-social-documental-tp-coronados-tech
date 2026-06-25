const HTTP = require("../../config/HttpCode");
const { sendValidationError } = require("../../helpers/validationError");

const requireImageMiddleware = (req, res, next) => {
  if (!req.file) {
    return sendValidationError(res, HTTP.BAD_REQUEST, "image", res.__("no_image_sent"));
  }
  next();
};

module.exports = requireImageMiddleware;
