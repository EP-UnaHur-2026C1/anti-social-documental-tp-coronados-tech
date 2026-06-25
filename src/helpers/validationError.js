const sendValidationError = (res, statusCode, atributo, error) => {
  return res.status(statusCode).json({
    errores: [{ atributo, error }],
  });
};

const sendValidationErrors = (res, statusCode, errores) => {
  return res.status(statusCode).json({ errores });
};

module.exports = { sendValidationError, sendValidationErrors };
