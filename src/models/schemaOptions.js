const jsonTransform = (_doc, ret) => {
  const { _id, __v, ...rest } = ret;
  return { id: _id, ...rest };
};

const defaultSchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: jsonTransform,
  },
  toObject: {
    virtuals: true,
    transform: jsonTransform,
  },
};

module.exports = { jsonTransform, defaultSchemaOptions };
