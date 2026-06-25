const HTTP = require("../../config/HttpCode");
const { sendUserFieldConflict } = require("../../helpers/duplicateUserField");
const { sendValidationError } = require("../../helpers/validationError");

const resolveFieldValue = (req, fields) => {
  for (const f of fields) {
    const value = req.params[f] ?? req.body?.[f] ?? req.query?.[f];
    if (value != null && value !== "") {
      return value;
    }
  }
  return null;
};

const existValidateMiddleware = (Modelo, field, { optional = false, aliases = [] } = {}) => {
  return async (req, res, next) => {
    const id = resolveFieldValue(req, [field, ...aliases]);

    if (id == null || id === "") {
      if (optional) return next();
      return sendValidationError(
        res,
        HTTP.BAD_REQUEST,
        field,
        res.__("field_required", { field }),
      );
    }

    const entity = await Modelo.findById(id);
    if (!entity) {
      return sendValidationError(
        res,
        HTTP.NOT_FOUND,
        field,
        res.__("id_dont_exist", { id, nombreModelo: Modelo.modelName }),
      );
    }

    next();
  };
};

const uniqueValidateMiddleware = (
  Modelo,
  field,
  { optional = false, aliases = [], excludeParam, normalize } = {},
) => {
  return async (req, res, next) => {
    const value = resolveFieldValue(req, [field, ...aliases]);

    if (value == null || value === "") {
      if (optional) return next();
      return sendValidationError(
        res,
        HTTP.BAD_REQUEST,
        field,
        res.__("field_required", { field }),
      );
    }

    const filter = { [field]: normalize ? normalize(value) : value };

    if (excludeParam) {
      const excludeId = req.params[excludeParam];
      if (excludeId) {
        filter._id = { $ne: excludeId };
      }
    }

    const entity = await Modelo.findOne(filter).select("_id").lean();
    if (entity) {
      return sendUserFieldConflict(res, field);
    }

    next();
  };
};

module.exports = existValidateMiddleware;
module.exports.uniqueValidateMiddleware = uniqueValidateMiddleware;
