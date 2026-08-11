import rapidKvClient from "./rapidKvClient.js";

class CacheService {

    // =========================
    // GET
    // =========================
    async get(key) {

        try {

            const data = await rapidKvClient.get(key);

            if (data === "NULL") {
                return null;
            }

            try {
                return JSON.parse(data);
            } catch {
                return data;
            }

        } catch (error) {

            console.error("⚠️ RapidKV GET Error:", error.message);

            return null;
        }
    }

    // =========================
    // SET
    // =========================
    async set(key, value, ttl = null) {

        try {

            let cacheValue = value;

            // Convert Mongoose document → Plain Object
            if (
                value &&
                typeof value.toObject === "function"
            ) {
                cacheValue = value.toObject();
            }

            // Convert Object → JSON
            if (typeof cacheValue !== "string") {
                cacheValue = JSON.stringify(cacheValue);
            }

            await rapidKvClient.set(key, cacheValue);

            if (ttl) {
                await rapidKvClient.expire(key, ttl);
            }

            return true;

        } catch (error) {

            console.error("⚠️ RapidKV SET Error:", error.message);

            return false;
        }
    }

    // =========================
    // DELETE
    // =========================
    async del(key) {

        try {

            await rapidKvClient.del(key);

        } catch (error) {

            console.error("⚠️ RapidKV DEL Error:", error.message);

        }

    }

    // =========================
    // CACHE ASIDE
    // =========================
    async getOrSet(key, dbCallback, ttl = null) {

        // 1️⃣ Try Cache

        const cached = await this.get(key);

        if (cached !== null) {

            console.log(`🟢 Cache HIT → ${key}`);

            return cached;

        }

        console.log(`🔴 Cache MISS → ${key}`);

        // 2️⃣ MongoDB Fallback

        const data = await dbCallback();

        if (data == null) {

            return null;

        }

        // 3️⃣ Store in Cache

        await this.set(key, data, ttl);

        return data;

    }

}

export default new CacheService();