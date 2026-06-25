const HTTP = require("../config/HttpCode");
const { sendValidationError } = require("./validationError");

const DUPLICATE_FIELD_MESSAGES = {
  email: "user_email_already_exists",
  nickname: "user_nickname_already_exists",
  name: "tag_already_exists",
};

const isDuplicateKeyError = (err) => {
  const code = err?.code ?? err?.errorResponse?.code;
  if (code === 11000 || code === "11000") return true;
  return typeof err?.message === "string" && err.message.includes("E11000");
};

const getDuplicateFieldFromError = (err) => {
  const keyPattern = err?.keyPattern ?? err?.errorResponse?.keyPattern;
  if (keyPattern && Object.keys(keyPattern).length > 0) {
    return Object.keys(keyPattern)[0];
  }

  const keyValue = err?.keyValue ?? err?.errorResponse?.keyValue;
  if (keyValue && Object.keys(keyValue).length > 0) {
    return Object.keys(keyValue)[0];
  }

  const match = err?.message?.match(/index:\s+(\w+)_\d+/);
  return match?.[1] ?? "campo";
};

const getDuplicateFieldErrorMessage = (res, field) => {
  const messageKey = DUPLICATE_FIELD_MESSAGES[field];
  if (messageKey) {
    return res.__(messageKey);
  }
  return res.__("user_already_exists", { field });
};

const sendUserFieldConflict = (res, field) => {
  return sendValidationError(
    res,
    HTTP.BAD_REQUEST,
    field,
    getDuplicateFieldErrorMessage(res, field),
  );
};

module.exports = {
  DUPLICATE_FIELD_MESSAGES,
  isDuplicateKeyError,
  getDuplicateFieldFromError,
  getDuplicateFieldErrorMessage,
  sendUserFieldConflict,
};
