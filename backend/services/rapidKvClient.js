import net from "net";
import rapidKvConfig from "../config/rapidKv.js";

class RapidKVClient {

    constructor() {
        this.socket = null;
        this.connected = false;
    }

    connect() {
        return new Promise((resolve, reject) => {

            this.socket = net.createConnection(
                {
                    host: rapidKvConfig.host,
                    port: rapidKvConfig.port
                },
                () => {
                    this.connected = true;
                    console.log(
                        `✅ Connected to RapidKV (${rapidKvConfig.host}:${rapidKvConfig.port})`
                    );
                }
            );

            this.socket.setEncoding("utf8");

            this.socket.once("data", (message) => {
                console.log(message.trim());
                resolve();
            });

            this.socket.on("error", (err) => {
                this.connected = false;
                console.error("RapidKV Error:", err.message);
            });

            this.socket.on("close", () => {
                this.connected = false;
                console.log("RapidKV Connection Closed");
            });

        });
    }

    send(command) {

        return new Promise((resolve, reject) => {

            if (!this.connected) {
                return reject(new Error("RapidKV is not connected"));
            }

            this.socket.once("data", (response) => {
                resolve(response.trim());
            });

            this.socket.write(command + "\n");

        });

    }

    // ==========================
    // Wrapper Methods
    // ==========================

    async get(key) {
        return this.send(`GET ${key}`);
    }

    async set(key, value) {
        return this.send(`SET ${key} ${value}`);
    }

    async del(key) {
        return this.send(`DEL ${key}`);
    }

    async expire(key, seconds) {
        return this.send(`EXPIRE ${key} ${seconds}`);
    }

    async ping() {
        return this.send("PING");
    }

}

export default new RapidKVClient();