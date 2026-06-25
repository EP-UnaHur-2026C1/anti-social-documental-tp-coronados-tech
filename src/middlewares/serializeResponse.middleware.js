const withIdFirst = require("../helpers/withIdFirst");

const serializeResponseMiddleware = (_req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = function serializeJson(body) {
    return originalJson(withIdFirst(body));
  };

  next();
};

module.exports = serializeResponseMiddleware;
