import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.join(socket.handshake.query.connectionId!);
  socket.on("send-message", (value, currentMemberId, toMemberId) => {
    socket.to(toMemberId).emit("receive-message", value, currentMemberId);
  });
  socket.on("new-message-settled", (toMemberId) => {
    socket.to(toMemberId).emit("receive-message-settled");
  });
});

server.listen(5000, () => {
  console.log("server running at http://localhost:5000");
});
