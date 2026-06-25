const i18n = require("../config/i18n");

class RedisCacheStore {
    constructor(redisClient, ttlSeconds) {
        this.redis = redisClient;
        this.ttlSeconds = ttlSeconds;
    }

    async get(key) {
        try {
            const raw = await this.redis.get(key);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (err) {
            console.error(i18n.__("redis_get_error", { error: err.message }));
            return null;
        }
    }

    async set(key, data) {
        try {
            await this.redis.setEx(key, this.ttlSeconds, JSON.stringify(data));
        } catch (err) {
            console.error(i18n.__("redis_set_error", { error: err.message }));
        }
    }

    async del(key) {
        try {
            await this.redis.del(key);
        } catch (err) {
            console.error(i18n.__("redis_del_error", { error: err.message }));
        }
    }

    async sMembers(key) {
        try {
            return await this.redis.sMembers(key);
        } catch (err) {
            console.error(i18n.__("redis_get_list_keys_error", { error: err.message }));
            return [];
        }
    }

    async sAdd(setKey, member) {
        try {
            await this.redis.sAdd(setKey, member);
        } catch (err) {
            console.error(i18n.__("redis_set_error", { error: err.message }));
        }
    }

    async sRem(setKey, member) {
        try {
            await this.redis.sRem(setKey, member);
        } catch (err) {
            console.error(i18n.__("redis_del_error", { error: err.message }));
        }
    }
}

module.exports = RedisCacheStore;
