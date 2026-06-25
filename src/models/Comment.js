const mongoose = require("mongoose");
const { defaultSchemaOptions } = require("./schemaOptions");

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;