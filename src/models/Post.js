const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema(
    {
        description: {
            type: String,
            required: true,
            trim: true,
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        tags: [
            {
                type: Schema.Types.ObjectId,
                ref: "Tag",
            }
        ],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;