const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true,
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        post_id: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },
    },
    {
        timestamps: true, // Esto crea automaticamente createdAt y updatedAt (clave para el filtro de meses)
        versionKey: false,
    }
);

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;