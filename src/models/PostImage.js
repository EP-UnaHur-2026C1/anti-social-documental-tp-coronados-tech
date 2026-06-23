const mongoose = require("mongoose");
const { Schema } = mongoose;

const postImageSchema = new Schema(
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
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const PostImage = mongoose.model("PostImage", postImageSchema);
module.exports = PostImage;