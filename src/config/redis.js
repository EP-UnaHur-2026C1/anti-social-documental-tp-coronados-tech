const { createClient } = require("redis");
const i18n = require("./i18n");

let client = null;

const isCacheEnabled = () => process.env.CACHE_POSTS_ENABLED !== "false";

const connectRedis = async () => {
    if (!isCacheEnabled()) {
        console.log(i18n.__("redis_cache_disabled"));
        return null;
    }

    const url = process.env.REDIS_URL || "redis://localhost:6379";
    client = createClient({ url });

    client.on("error", (err) => {
        console.error(i18n.__("redis_client_error", { error: err.message }));
    });

    try {
        await client.connect();
        console.log(i18n.__("redis_connected"));
        return client;
    } catch (err) {
        throw new Error(i18n.__("redis_connection_failed", { error: err.message }));
    }
};

const getRedis = () => {
    if (!client) {
        throw new Error(i18n.__("redis_not_connected"));
    }
    return client;
};

const disconnectRedis = async () => {
    if (client) {
        await client.quit();
        client = null;
    }
};

module.exports = {
    connectRedis,
    getRedis,
    disconnectRedis,
    isCacheEnabled,
};
