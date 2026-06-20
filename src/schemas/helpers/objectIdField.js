const mongoose = require("mongoose");
const Joi = require("joi");

const objectIdField = (fieldName) =>
  Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "any.required": `${fieldName} es requerido`,
      "any.invalid": `${fieldName} debe ser un ObjectId válido`,
      "string.base": `${fieldName} debe ser un string`,
      "string.empty": `${fieldName} no puede estar vacío`,
    });

module.exports = { objectIdField };
