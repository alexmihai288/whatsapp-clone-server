import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors"; // Import the cors middleware
import { db } from "./db";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
app.use(cors());

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

io.on("connection", async (socket) => {
  console.log("a user connected");

  socket.join(socket.handshake.query.connectionId!);

  const currentUserGroups = await db.profile.findFirst({
    where: {
      connectionId: socket.handshake.query.connectionId as string,
    },
    include: {
      groupsMember: true,
    },
  });

  currentUserGroups?.groupsMember?.map((group) => socket.join(group.groupId));

  socket.on("send-start-conversation",(connectionId)=>{
    socket.to(connectionId).emit("receive-send-start-conversation");
  })

  socket.on(
    "send-message",
    (value, fileUrl, currentMemberId, toMemberId, conversationId) => {
      socket
        .to(toMemberId)
        .emit(
          "receive-message",
          value,
          fileUrl,
          currentMemberId,
          conversationId
        );
    }
  );
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

  socket.on(
    "send-group-message",
    (value, fileUrl, currentMemberId, groupId) => {
      socket
        .to(groupId)
        .emit(
          "receive-group-message",
          value,
          fileUrl,
          currentMemberId,
          groupId
        );
    }
  );

  socket.on("new-group-message-settled", (groupId) => {
    socket.to(groupId).emit("receive-group-message-settled");
  });

  socket.on("send-kick", (connectionId) => {
    console.log(connectionId);
    socket.to(connectionId).emit("receive-send-kick");
  });
});

server.listen(5000, () => {
  console.log("server running at http://localhost:5000");
});
