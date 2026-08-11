import net from "net";
import rapidKvConfig from "../config/rapidKv.js";

class RapidKVClient {
    constructor() {
        this.socket = null;
        this.connected = false;

        this.buffer = "";
        this.pendingQueue = [];

        this.connectPromise = null;
        this.connectResolve = null;
        this.connectReject = null;
        this.reconnectTimer = null;

        this.reconnectDelay = 3000;
        this.requestTimeout = 5000;
    }

    // =====================================
    // CONNECT
    // =====================================
    async connect() {
        if (this.connected) return;

        if (!this.connectPromise) {
            this.connectPromise = new Promise((resolve, reject) => {
                this.connectResolve = resolve;
                this.connectReject = reject;
            });
        }

        if (!this.socket || this.socket.destroyed) {
            this.createSocket();
        }

        return this.connectPromise;
    }

    createSocket() {
        this.socket = net.createConnection(
            {
                host: rapidKvConfig.host,
                port: rapidKvConfig.port,
            },
            () => {
                this.connected = true;
                console.log(
                    `✅ RapidKV Connected (${rapidKvConfig.host}:${rapidKvConfig.port})`
                );
            }
        );

        this.socket.setEncoding("utf8");

        this.socket.on("data", (chunk) => {
            this.buffer += chunk;
            this.processBuffer();
        });

        this.socket.on("error", (err) => {
            console.error("RapidKV Error:", err.message);
            this.connected = false;
        });

        this.socket.on("close", () => {
            console.log("RapidKV Connection Closed");
            this.connected = false;
            this.socket = null;

            if (!this.reconnectTimer) {
                this.reconnectTimer = setTimeout(() => {
                    this.reconnectTimer = null;
                    console.log("Reconnecting RapidKV...");
                    this.connect().catch(() => {});
                }, this.reconnectDelay);
            }
        });

        // Welcome message
        this.socket.once("data", () => {
            if (this.connectResolve) {
                this.connectResolve();
                this.connectResolve = null;
                this.connectReject = null;
                this.connectPromise = null;
            }
        });
    }

    // =====================================
    // PROCESS BUFFER
    // =====================================
    processBuffer() {

        while (true) {

            const index = this.buffer.indexOf("\n");

            if (index === -1) break;

            const line = this.buffer.slice(0, index).trim();

            this.buffer = this.buffer.slice(index + 1);

            const pending = this.pendingQueue.shift();

            if (!pending) continue;

            clearTimeout(pending.timeout);

            pending.resolve(line);

        }

    }

    // =====================================
    // SEND COMMAND
    // =====================================
    send(command) {

        return new Promise((resolve, reject) => {

            if (!this.connected) {
                return reject(
                    new Error("RapidKV is not connected")
                );
            }

            const timeout = setTimeout(() => {

                reject(
                    new Error(
                        `RapidKV Timeout (${command})`
                    )
                );

            }, this.requestTimeout);

            this.pendingQueue.push({
                resolve,
                reject,
                timeout,
            });

            this.socket.write(command + "\n");

        });

    }

    // =====================================
    // COMMANDS
    // =====================================

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

    // =====================================
    // CLOSE
    // =====================================

    disconnect() {

        if (this.socket) {
            this.socket.end();
        }

        this.connected = false;

    }

}

export default new RapidKVClient();