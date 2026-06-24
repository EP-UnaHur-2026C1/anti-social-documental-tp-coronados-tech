const { createClient } = require("redis");

let client = null;

const isCacheEnabled = () => process.env.CACHE_POSTS_ENABLED !== "false";

const connectRedis = async () => {
    if (!isCacheEnabled()) {
        console.log("Caché de posts desactivada (CACHE_POSTS_ENABLED=false)");
        return null;
    }

    const url = process.env.REDIS_URL || "redis://localhost:6379";
    client = createClient({ url });

    client.on("error", (err) => {
        console.error("Redis error:", err.message);
    });

    await client.connect();
    console.log("Redis conectado");
    return client;
};

const getRedis = () => {
    if (!client) {
        throw new Error("Redis no está conectado");
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
