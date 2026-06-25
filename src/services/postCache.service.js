const { getRedis } = require("../config/redis");
const i18n = require("../config/i18n");

const enabled = process.env.CACHE_POSTS_ENABLED !== "false";
const ttlSeconds = Math.max(1, Number(process.env.CACHE_POSTS_TTL_SECONDS || 60));
const LIST_KEYS_SET = "posts:list-keys";

const postKey = (id) => `post:${id}`;

const resolveId = (value) => {
    if (value == null) return null;
    if (typeof value === "object") return value.id ?? value._id;
    return value;
};

const matchId = (a, b) => String(resolveId(a) ?? a) === String(resolveId(b) ?? b);

const isListKey = (key) => key === "posts:all" || key.startsWith("posts:user:");

const get = async (key) => {
    if (!enabled) return null;

    try {
        const raw = await getRedis().get(key);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (err) {
        console.error(i18n.__("redis_get_error", { error: err.message }));
        return null;
    }
};

const set = async (key, data) => {
    if (!enabled) return;

    try {
        const redis = getRedis();
        await redis.setEx(key, ttlSeconds, JSON.stringify(data));

        if (isListKey(key)) {
            await redis.sAdd(LIST_KEYS_SET, key);
        }
    } catch (err) {
        console.error(i18n.__("redis_set_error", { error: err.message }));
    }
};

const del = async (key) => {
    if (!enabled) return;

    try {
        const redis = getRedis();
        await redis.del(key);

        if (isListKey(key)) {
            await redis.sRem(LIST_KEYS_SET, key);
        }
    } catch (err) {
        console.error(i18n.__("redis_del_error", { error: err.message }));
    }
};

const getListKeys = async () => {
    try {
        return await getRedis().sMembers(LIST_KEYS_SET);
    } catch (err) {
        console.error(i18n.__("redis_get_list_keys_error", { error: err.message }));
        return [];
    }
};

const mutatePost = async (postId, mutator) => {
    if (!enabled) return;

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

const addPostToLists = async (post) => {
    if (!enabled) return;

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
    if (!enabled) return;

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

const deleteAll = async () => {
    if (!enabled) return;

    try {
        const redis = getRedis();
        const listKeys = await getListKeys();
        const postKeys = await redis.keys("post:*");
        const userListKeys = await redis.keys("posts:user:*");
        const keysToDelete = [
            ...new Set([...listKeys, ...postKeys, ...userListKeys, "posts:all", LIST_KEYS_SET]),
        ];

        if (keysToDelete.length) {
            await redis.del(keysToDelete);
        }
    } catch (err) {
        console.error(i18n.__("redis_delete_all_error", { error: err.message }));
    }
};

module.exports = {
    get,
    set,
    deletePost: removePostFromCaches,
    deleteAll,
    removePostFromCaches,
    addPostToLists,
    mutatePost,
    addComment,
    updateComment,
    removeComment,
    addPostImage,
    updatePostImage,
    removePostImage,
    movePostImage,
    updatePostFields,
    isEnabled: () => enabled,
    ttlSeconds: () => ttlSeconds,
};
