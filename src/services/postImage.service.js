const { PostImage } = require("../models");
const fs = require("fs");
const postCache = require("./postCache.service");

const create = async ({ filename, path, post_id }) => {
    const image = await PostImage.create({ filename, path, post_id });
    postCache.deletePost(post_id);
    return image;
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

module.exports = {
    create,
    removeAllByPostId,
};