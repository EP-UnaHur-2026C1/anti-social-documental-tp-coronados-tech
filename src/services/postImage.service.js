const { PostImage, Post } = require("../models");
const fs = require("fs");
const postCache = require("./postCache.service");

const findPost = (postId) => Post.findById(postId);

const create = async ({ filename, path, post_id, postId }) => {
    const pid = post_id ?? postId;
    const image = await PostImage.create({ filename, path, post_id: pid });
    await postCache.addPostImage(pid, image.toObject());
    return image;
};

const findByPostId = async (postId) => {
    const post = await findPost(postId);
    if (!post) return { post: null, images: null };

    const images = await PostImage.find({ post_id: postId });
    return { post, images };
};

const findById = (id) => PostImage.findById(id);

const findScoped = async (id, postId) => {
    const filter = { _id: id };
    if (postId != null) filter.post_id = postId;

    const postImage = await PostImage.findOne(filter);
    if (postImage) return { postImage };

    if (postId != null) {
        const post = await findPost(postId);
        if (!post) return { status: "post_not_found" };
        return { status: "image_not_found" };
    }

    return { status: "not_found" };
};

const update = async (id, { postId, filename, path, newPostId }) => {
    const scoped = await findScoped(id, postId);
    if (scoped.status) return scoped;

    const { postImage } = scoped;
    const targetPostId = newPostId ?? postImage.post_id;

    if (newPostId != null) {
        const post = await findPost(newPostId);
        if (!post) return { status: "post_not_found" };
    }

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

    return { status: "ok", postImage };
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

const remove = async (id, { postId } = {}) => {
    const scoped = await findScoped(id, postId);
    if (scoped.status) return scoped;

    const { post_id, path } = scoped.postImage;
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
    await scoped.postImage.deleteOne();
    await postCache.removePostImage(post_id, id);

    return { status: "ok" };
};

module.exports = {
    create,
    findByPostId,
    findById,
    update,
    removeAllByPostId,
    remove,
};
