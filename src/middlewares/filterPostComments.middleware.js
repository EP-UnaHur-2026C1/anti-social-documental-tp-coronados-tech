const { filterCommentsByMonths } = require("../helpers/filterCommentsByMonths");

const filterPostCommentsMiddleware = (req, res, next) => {
    const originalJson = res.json;

    res.json = function (body) {
        const months = req.query.meses;

        if (months && body && body.data) {
            if (Array.isArray(body.data)) {
                // Si es el listado completo de posts (findAll)
                body.data = filterCommentsByMonths(body.data, months);
            } else if (body.data.comments) {
                // Si es un único post por ID (findById)
                body.data = filterCommentsByMonths([body.data], months)[0];
            }
        }

        return originalJson.call(this, body);
    };

    next();
};

module.exports = filterPostCommentsMiddleware;