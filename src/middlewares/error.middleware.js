const HTTP = require("../config/HttpCode");

const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "campo";
    return res.status(HTTP.CONFLICT).json({
      message: res.__("user_already_exists", { field }),
      error: err.message,
    });
  }

  console.error(err);
  res.status(HTTP.INTERNAL_SERVER_ERROR).json({
    message: res.__("error_internal"),
    error: err.message,
  });
};

module.exports = errorMiddleware;
