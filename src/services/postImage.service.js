const { PostImage } = require("../models");
const fs = require("fs");
const postCache = require("./postCache.service");

const create = async ({ filename, path, post_id, postId }) => {
    const pid = post_id ?? postId;
    const image = await PostImage.create({ filename, path, post_id: pid });
    await postCache.addPostImage(pid, image.toObject());
    return image;
};

const findByPostId = async (postId) => {
    return PostImage.find({ post_id: postId });
};

const findById = (id) => PostImage.findById(id);

const update = async (id, { postId, filename, path, newPostId }) => {
    const postImage = await PostImage.findOne({ _id: id, post_id: postId });
    const targetPostId = newPostId ?? postImage.post_id;

    if (path && fs.existsSync(postImage.path)) {
        fs.unlinkSync(postImage.path);
    }

    const previousPostId = postImage.post_id;
    postImage.post_id = targetPostId;
    if (filename) postImage.filename = filename;
    if (path) postImage.path = path;
    await postImage.save();

    const imageJson = postImage.toObject();
    if (targetPostId.toString() !== previousPostId.toString()) {
        await postCache.movePostImage(previousPostId, targetPostId, id, imageJson);
    } else {
        await postCache.updatePostImage(targetPostId, id, imageJson);
    }

    return postImage;
};

const removeAllByPostId = async (post_id) => {
    const images = await PostImage.find({ post_id });

    for (const img of images) {
        if (fs.existsSync(img.path)) {
            fs.unlinkSync(img.path);
        }
    }

    await PostImage.deleteMany({ post_id });
};

const remove = async (id, { postId }) => {
    const postImage = await PostImage.findOne({ _id: id, post_id: postId });
    const { post_id, path } = postImage;

    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
    await postImage.deleteOne();
    await postCache.removePostImage(post_id, id);
};

module.exports = {
    create,
    findByPostId,
    findById,
    update,
    removeAllByPostId,
    remove,
};
