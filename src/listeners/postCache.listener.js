const { postEvents, POST_EVENTS } = require("../events/postEvents");
const postCache = require("../services/postCache.service");

const registerPostCacheListener = () => {
    postEvents.on(POST_EVENTS.COMMENT_CREATED, async ({ postId, comment }) => {
        await postCache.addComment(postId, comment);
    });

    postEvents.on(POST_EVENTS.COMMENT_UPDATED, async ({ postId, commentId, comment }) => {
        await postCache.updateComment(postId, commentId, comment);
    });

    postEvents.on(POST_EVENTS.COMMENT_REMOVED, async ({ postId, commentId }) => {
        await postCache.removeComment(postId, commentId);
    });

    postEvents.on(POST_EVENTS.POST_IMAGE_CREATED, async ({ postId, image }) => {
        await postCache.addPostImage(postId, image);
    });

    postEvents.on(POST_EVENTS.POST_IMAGE_UPDATED, async ({ postId, imageId, image }) => {
        await postCache.updatePostImage(postId, imageId, image);
    });

    postEvents.on(POST_EVENTS.POST_IMAGE_MOVED, async ({ fromPostId, toPostId, imageId, image }) => {
        await postCache.movePostImage(fromPostId, toPostId, imageId, image);
    });

    postEvents.on(POST_EVENTS.POST_IMAGE_REMOVED, async ({ postId, imageId }) => {
        await postCache.removePostImage(postId, imageId);
    });

    postEvents.on(POST_EVENTS.TAG_ADDED_TO_POST, async ({ postId, tag }) => {
        await postCache.addTagToPost(postId, tag);
    });

    postEvents.on(POST_EVENTS.POST_FIELDS_UPDATED, async ({ postId, fields }) => {
        await postCache.updatePostFields(postId, fields);
    });

    postEvents.on(POST_EVENTS.POST_ADDED_TO_LISTS, async ({ post }) => {
        await postCache.addPostToLists(post);
    });

    postEvents.on(POST_EVENTS.POST_REMOVED, async ({ postId }) => {
        await postCache.removePostFromCaches(postId);
    });
};

module.exports = registerPostCacheListener;
