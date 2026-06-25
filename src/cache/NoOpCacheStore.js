class NoOpCacheStore {
    async get() {
        return null;
    }

    async set() {}

    async del() {}

    async sMembers() {
        return [];
    }

    async sAdd() {}

    async sRem() {}
}

module.exports = NoOpCacheStore;
