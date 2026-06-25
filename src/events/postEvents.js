const EventEmitter = require("events");

const POST_EVENTS = {
    COMMENT_CREATED: "comment:created",
    COMMENT_UPDATED: "comment:updated",
    COMMENT_REMOVED: "comment:removed",
    POST_IMAGE_CREATED: "postImage:created",
    POST_IMAGE_UPDATED: "postImage:updated",
    POST_IMAGE_MOVED: "postImage:moved",
    POST_IMAGE_REMOVED: "postImage:removed",
    TAG_ADDED_TO_POST: "tag:addedToPost",
    POST_FIELDS_UPDATED: "post:fieldsUpdated",
    POST_ADDED_TO_LISTS: "post:addedToLists",
    POST_REMOVED: "post:removed",
};

class PostEvents extends EventEmitter {}

const postEvents = new PostEvents();

const emitPostEvent = async (event, payload) => {
    const listeners = postEvents.listeners(event);
    for (const listener of listeners) {
        await listener(payload);
    }
};

module.exports = {
    postEvents,
    POST_EVENTS,
    emitPostEvent,
};
