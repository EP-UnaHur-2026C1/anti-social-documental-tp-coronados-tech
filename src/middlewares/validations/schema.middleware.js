const HTTP = require("../../config/HttpCode");
const { sendValidationErrors } = require("../../helpers/validationError");

const validateRequest = (schema, source, targetKey) => {
  return (req, res, next) => {
    const result = schema.validate(req[source] ?? {}, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (result.error) {
      return sendValidationErrors(
        res,
        HTTP.BAD_REQUEST,
        result.error.details.map((e) => ({
          atributo: e.path[0] || source,
          error: e.message,
        })),
      );
    }
    req[targetKey] = result.value;
    next();
  };
};

const schemaValidatorMiddleware = (schema) => validateRequest(schema, "body", "body");

const querySchemaValidatorMiddleware = (schema) => validateRequest(schema, "query", "query");

module.exports = schemaValidatorMiddleware;
module.exports.querySchemaValidatorMiddleware = querySchemaValidatorMiddleware;
