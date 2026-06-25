const { PostImage } = require("../models");
const fs = require("fs");
const { emitPostEvent, POST_EVENTS } = require("../events/postEvents");

const create = async ({ filename, path, post_id, postId }) => {
    const pid = post_id ?? postId;
    const image = await PostImage.create({ filename, path, post_id: pid });
    await emitPostEvent(POST_EVENTS.POST_IMAGE_CREATED, { postId: pid, image: image.toObject() });
    return image;
};

const findByPostId = async (postId) => {
    return PostImage.find({ post_id: postId });
};

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
        await emitPostEvent(POST_EVENTS.POST_IMAGE_MOVED, {
            fromPostId: previousPostId,
            toPostId: targetPostId,
            imageId: id,
            image: imageJson,
        });
    } else {
        await emitPostEvent(POST_EVENTS.POST_IMAGE_UPDATED, {
            postId: targetPostId,
            imageId: id,
            image: imageJson,
        });
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
    await emitPostEvent(POST_EVENTS.POST_IMAGE_REMOVED, { postId: post_id, imageId: id });
};

module.exports = {
    create,
    findByPostId,
    update,
    removeAllByPostId,
    remove,
};
