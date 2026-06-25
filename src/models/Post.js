const mongoose = require("mongoose");
const { defaultSchemaOptions } = require("./schemaOptions");

const postSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            required: true,
            trim: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        tags: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Tag",
            }
        ],
    },
    defaultSchemaOptions,
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;