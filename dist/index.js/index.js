"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors")); // Import the cors middleware
const db_1 = require("./db");
const app = (0, express_1.default)();
const server = (0, node_http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
app.use((0, cors_1.default)());
app.get("/", (req, res) => {
    res.send("<h1>Hello world</h1>");
});
io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("a user connected");
    socket.join(socket.handshake.query.connectionId);
    const currentUserGroups = yield db_1.db.profile.findFirst({
        where: {
            connectionId: socket.handshake.query.connectionId,
        },
        include: {
            groupsMember: true,
        },
    });
    currentUserGroups === null || currentUserGroups === void 0 ? void 0 : currentUserGroups.groupsMember.map((group) => socket.join(group.groupId));
    socket.on("send-start-conversation", (connectionId) => {
        socket.to(connectionId).emit("receive-send-start-conversation");
    });
    socket.on("send-message", (value, fileUrl, currentMemberId, toMemberId, conversationId) => {
        socket
            .to(toMemberId)
            .emit("receive-message", value, fileUrl, currentMemberId, conversationId);
    });
    socket.on("new-message-settled", (toMemberId) => {
        socket.to(toMemberId).emit("receive-message-settled");
    });
    //groups
    socket.on("join-group", (groupId) => {
        socket.join(groupId);
    });
    socket.on("invite-to-group", (memberId, groupId) => {
        socket.to(memberId).emit("receive-invite-to-group", groupId);
    });
    socket.on("send-group-message", (value, fileUrl, currentMemberId, groupId) => {
        socket
            .to(groupId)
            .emit("receive-group-message", value, fileUrl, currentMemberId, groupId);
    });
    socket.on("new-group-message-settled", (groupId) => {
        socket.to(groupId).emit("receive-group-message-settled");
    });
    socket.on("send-kick", (connectionId) => {
        console.log(connectionId);
        socket.to(connectionId).emit("receive-send-kick");
    });
}));
server.listen(5000, () => {
    console.log("server running at http://localhost:5000");
});
