const NoOpCacheStore = require("../cache/NoOpCacheStore");
const RedisCacheStore = require("../cache/RedisCacheStore");
const { getRedis } = require("./redis");

let cacheStore = null;

const isCacheEnabled = () => process.env.CACHE_POSTS_ENABLED !== "false";

const initCacheStore = () => {
    const ttlSeconds = Math.max(1, Number(process.env.CACHE_POSTS_TTL_SECONDS || 60));

    if (!isCacheEnabled()) {
        cacheStore = new NoOpCacheStore();
    } else {
        cacheStore = new RedisCacheStore(getRedis(), ttlSeconds);
    }

    return cacheStore;
};

const getCacheStore = () => {
    if (!cacheStore) {
        throw new Error("Cache store not initialized");
    }
    return cacheStore;
};

module.exports = {
    initCacheStore,
    getCacheStore,
    isCacheEnabled,
};
