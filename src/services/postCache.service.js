const { getCacheStore } = require("../config/cache");

const LIST_KEYS_SET = "posts:list-keys";

const postKey = (id) => `post:${id}`;

const resolveId = (value) => {
    if (value == null) return null;
    if (typeof value === "object") return value.id ?? value._id;
    return value;
};

const matchId = (a, b) => String(resolveId(a) ?? a) === String(resolveId(b) ?? b);

const isListKey = (key) => key === "posts:all" || key.startsWith("posts:user:");

const store = () => getCacheStore();

const get = async (key) => store().get(key);

const set = async (key, data) => {
    await store().set(key, data);

    if (isListKey(key)) {
        await store().sAdd(LIST_KEYS_SET, key);
    }
};

const del = async (key) => {
    await store().del(key);

    if (isListKey(key)) {
        await store().sRem(LIST_KEYS_SET, key);
    }
};

const getListKeys = async () => store().sMembers(LIST_KEYS_SET);

const mutatePost = async (postId, mutator) => {
    const id = String(postId);
    const key = postKey(id);

    const cached = await get(key);
    if (cached) {
        mutator(cached);
        await set(key, cached);
    }

    const listKeys = await getListKeys();
    for (const listKey of listKeys) {
        const list = await get(listKey);
        if (!Array.isArray(list)) continue;

        const index = list.findIndex((post) => matchId(post, id));
        if (index === -1) continue;

        mutator(list[index]);
        await set(listKey, list);
    }
};

const addComment = async (postId, comment) =>
    mutatePost(postId, (post) => {
        if (!Array.isArray(post.comments)) {
            post.comments = [];
        }
        post.comments.push(comment);
    });

const updateComment = async (postId, commentId, comment) =>
    mutatePost(postId, (post) => {
        if (!Array.isArray(post.comments)) return;

        const index = post.comments.findIndex((item) => matchId(item, commentId));
        if (index !== -1) {
            post.comments[index] = comment;
        }
    });

const removeComment = async (postId, commentId) =>
    mutatePost(postId, (post) => {
        if (!Array.isArray(post.comments)) return;
        post.comments = post.comments.filter((item) => !matchId(item, commentId));
    });

const addPostImage = async (postId, image) =>
    mutatePost(postId, (post) => {
        if (!Array.isArray(post.postImages)) {
            post.postImages = [];
        }
        post.postImages.push(image);
    });

const updatePostImage = async (postId, imageId, image) =>
    mutatePost(postId, (post) => {
        if (!Array.isArray(post.postImages)) return;

        const index = post.postImages.findIndex((item) => matchId(item, imageId));
        if (index !== -1) {
            post.postImages[index] = image;
        }
    });

const removePostImage = async (postId, imageId) =>
    mutatePost(postId, (post) => {
        if (!Array.isArray(post.postImages)) return;
        post.postImages = post.postImages.filter((item) => !matchId(item, imageId));
    });

const movePostImage = async (fromPostId, toPostId, imageId, image) => {
    await removePostImage(fromPostId, imageId);
    await addPostImage(toPostId, image);
};

const updatePostFields = async (postId, fields) =>
    mutatePost(postId, (post) => {
        Object.assign(post, fields);
    });

const addTagToPost = async (postId, tag) =>
    mutatePost(postId, (cached) => {
        if (!Array.isArray(cached.tags)) {
            cached.tags = [];
        }
        const tagId = tag._id ?? tag.id;
        const exists = cached.tags.some((item) => String(item._id ?? item.id) === String(tagId));
        if (!exists) {
            cached.tags.push(tag);
        }
    });

const addPostToLists = async (post) => {
    const id = String(resolveId(post));

    const allList = await get("posts:all");
    if (Array.isArray(allList) && !allList.some((item) => matchId(item, id))) {
        allList.unshift(post);
        await set("posts:all", allList);
    }

    const userId = resolveId(post.user);
    if (!userId) return;

    const userListKey = `posts:user:${userId}`;
    const userList = await get(userListKey);
    if (Array.isArray(userList) && !userList.some((item) => matchId(item, id))) {
        userList.unshift(post);
        await set(userListKey, userList);
    }
};

const removePostFromCaches = async (postId) => {
    const id = String(postId);
    await del(postKey(id));

    const listKeys = await getListKeys();
    for (const listKey of listKeys) {
        const list = await get(listKey);
        if (!Array.isArray(list)) continue;

        const filtered = list.filter((post) => !matchId(post, id));
        if (filtered.length !== list.length) {
            await set(listKey, filtered);
        }
    }
};

module.exports = {
    get,
    set,
    removePostFromCaches,
    addPostToLists,
    addTagToPost,
    addComment,
    updateComment,
    removeComment,
    addPostImage,
    updatePostImage,
    removePostImage,
    movePostImage,
    updatePostFields,
};
