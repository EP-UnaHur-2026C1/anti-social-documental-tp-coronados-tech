const isObjectId = (value) =>
  value != null &&
  typeof value === "object" &&
  value.constructor?.name === "ObjectId";

const toPlainValue = (value) => {
  if (value == null) return value;
  if (typeof value.toJSON === "function" && !Array.isArray(value)) {
    return value.toJSON();
  }
  return value;
};

const withIdFirst = (value) => {
  const plain = toPlainValue(value);

  if (plain == null || typeof plain !== "object") {
    return plain;
  }

  if (Array.isArray(plain)) {
    return plain.map(withIdFirst);
  }

  if (plain instanceof Date || isObjectId(plain)) {
    return plain;
  }

  const obj = { ...plain };
  if (obj.id == null && obj._id != null) {
    obj.id = obj._id;
    delete obj._id;
  }

  const ordered = {};
  if (obj.id != null) {
    ordered.id = obj.id;
  }

  for (const [key, nested] of Object.entries(obj)) {
    if (key === "id" || key === "_id") continue;
    ordered[key] = withIdFirst(nested);
  }

  return ordered;
};

module.exports = withIdFirst;
