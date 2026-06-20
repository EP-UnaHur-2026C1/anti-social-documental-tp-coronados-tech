const jsonTransform = (_doc, ret) => {
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
  return ret;
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
