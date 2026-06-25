const mongoose = require("mongoose");
const HTTP = require("../../config/HttpCode");
const { sendValidationError } = require("../../helpers/validationError");

const objectIdParamValidateMiddleware = (fieldName) => {
  return (req, res, next) => {
    const id = req.params[fieldName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendValidationError(
        res,
        HTTP.BAD_REQUEST,
        fieldName,
        res.__("parameter_object_id", { field: fieldName }),
      );
    }
    next();
  };
};

module.exports = objectIdParamValidateMiddleware;
