import dotenv from "dotenv";

dotenv.config();

const rapidKvConfig = {
    host: process.env.RAPIDKV_HOST || "localhost",
    port: Number(process.env.RAPIDKV_PORT) || 6379,
};

export default rapidKvConfig;