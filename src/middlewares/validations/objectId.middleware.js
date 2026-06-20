const mongoose = require("mongoose");
const HTTP = require("../../config/HttpCode");

const objectIdParamValidateMiddleware = (fieldName) => {
  return (req, res, next) => {
    const id = req.params[fieldName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(HTTP.BAD_REQUEST).json({
        message: res.__("parameter_object_id", { field: fieldName }),
      });
    }
    next();
  };
};

module.exports = objectIdParamValidateMiddleware;
