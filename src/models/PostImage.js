const mongoose = require("mongoose");
const { defaultSchemaOptions } = require("./schemaOptions");

const postImageSchema = new mongoose.Schema(
    {
        filename: {
            type: String,
            required: true,
        },
        path: {
            type: String,
            required: true,
        },
        post_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },
    },
    defaultSchemaOptions,
);

const PostImage = mongoose.model("PostImage", postImageSchema);
module.exports = PostImage;