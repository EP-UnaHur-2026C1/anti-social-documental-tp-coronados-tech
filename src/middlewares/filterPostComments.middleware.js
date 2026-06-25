const { filterCommentsByMonths } = require("../helpers/filterCommentsByMonths");

const defaultMonths = process.env.MESES;

const filterPostCommentsMiddleware = (req, res, next) => {
    const originalJson = res.json;

    res.json = function (body) {
        const months = req.query.meses ?? defaultMonths;

        if (months && body) {
            if (Array.isArray(body)) {
                return originalJson.call(this, filterCommentsByMonths(body, months));
            }
            if (body.comments) {
                const [filtered] = filterCommentsByMonths([body], months);
                return originalJson.call(this, filtered);
            }
        }

        return originalJson.call(this, body);
    };

    next();
};

module.exports = filterPostCommentsMiddleware;
