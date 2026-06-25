const HTTP = require("../config/HttpCode");
const {
  isDuplicateKeyError,
  getDuplicateFieldFromError,
  sendUserFieldConflict,
} = require("../helpers/duplicateUserField");
const { sendValidationError } = require("../helpers/validationError");

const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (isDuplicateKeyError(err)) {
    console.warn("[duplicate key]", err.message);
    const field = getDuplicateFieldFromError(err);
    return sendUserFieldConflict(res, field);
  }

  console.error(err);
  return sendValidationError(
    res,
    HTTP.INTERNAL_SERVER_ERROR,
    "servidor",
    res.__("error_internal"),
  );
};

module.exports = errorMiddleware;
