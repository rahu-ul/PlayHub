import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import dns from "node:dns";

import connectDb from "./config/connectDb.js";
import rapidKvClient from "./services/rapidKvClient.js";

import authRouter from "./route/authRoute.js";
import userRouter from "./route/userRoute.js";
import contentRouter from "./route/contentRoute.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cookieParser());
app.use(express.json());

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://play-hub-six.vercel.app",
        ],
        credentials: true,
    })
);

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/content", contentRouter);

app.get("/", (req, res) => {
    res.send("Hello from Server");
});

// ==========================
// START SERVER
// ==========================

const startServer = async () => {
    try {

        // 1. Connect MongoDB
        await connectDb();
        console.log("✅ MongoDB Connected");

        // 2. Start Express immediately
        app.listen(port, () => {
            console.log(`🚀 Server Started on Port ${port}`);
        });

        // 3. Connect RapidKV in the background
        rapidKvClient.connect()
            .then(() => {
                console.log("✅ RapidKV Connected");
            })
            .catch((error) => {
                console.error("RapidKV background connection failed:", error.message);
            });

    } catch (error) {

        console.error("❌ Server Startup Failed");
        console.error(error);

        process.exit(1);

    }
};

startServer();