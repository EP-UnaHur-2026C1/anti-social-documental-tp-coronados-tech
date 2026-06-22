const mongoose = require("mongoose");
const { defaultSchemaOptions } = require("./schemaOptions");

const tagSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
    },
    defaultSchemaOptions,
);

const Tag = mongoose.model("Tag", tagSchema);

module.exports = Tag;
