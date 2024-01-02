"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = (0, node_http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
app.get("/", (req, res) => {
    res.send("<h1>Hello world</h1>");
});
io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("send-message", (value, currentMemberId) => {
        io.emit("receive-message", value, currentMemberId);
    });
    socket.on("new-message-error", () => {
        io.emit("receive-message-error");
    });
});
server.listen(5000, () => {
    console.log("server running at http://localhost:5000");
});
