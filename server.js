const { createServer } = require("http");
const parse = require("url").parse;
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    socket.on("room:join", ({ roomId, peerId, displayName }) => {
      socket.data.roomId = roomId;
      socket.data.peerId = peerId;
      socket.data.displayName = displayName;

      socket.join(roomId);

      // Collect existing room participants
      const roomSockets = io.sockets.adapter.rooms.get(roomId);
      const peers = [];
      if (roomSockets) {
        for (const sId of roomSockets) {
          const s = io.sockets.sockets.get(sId);
          if (s && s.data.peerId && s.data.peerId !== peerId) {
            peers.push({
              peerId: s.data.peerId,
              displayName: s.data.displayName || "Peer",
            });
          }
        }
      }

      // Send existing peers list back to the joining peer
      socket.emit("room:peers", { peers });

      // Notify other peers in the room about the new participant
      socket.to(roomId).emit("room:peer-joined", {
        peerId,
        displayName,
      });
    });

    // WebRTC Targeted Signaling Relay: Offer
    socket.on("webrtc:offer", ({ roomId, senderPeerId, targetPeerId, sdp, candidates }) => {
      socket.to(roomId).emit("webrtc:offer", {
        senderPeerId,
        targetPeerId,
        sdp,
        candidates,
      });
    });

    // WebRTC Targeted Signaling Relay: Answer
    socket.on("webrtc:answer", ({ roomId, senderPeerId, targetPeerId, sdp, candidates }) => {
      socket.to(roomId).emit("webrtc:answer", {
        senderPeerId,
        targetPeerId,
        sdp,
        candidates,
      });
    });

    // WebRTC Trickle ICE Candidate Relay
    socket.on("webrtc:ice-candidate", ({ roomId, senderPeerId, targetPeerId, candidate }) => {
      socket.to(roomId).emit("webrtc:ice-candidate", {
        senderPeerId,
        targetPeerId,
        candidate,
      });
    });

    // Realtime Control / Presence Events
    socket.on("typing:start", ({ roomId, senderPeerId, senderName }) => {
      socket.to(roomId).emit("typing:start", { senderPeerId, senderName });
    });

    socket.on("typing:stop", ({ roomId, senderPeerId }) => {
      socket.to(roomId).emit("typing:stop", { senderPeerId });
    });

    // Lightweight Text Chat Message Relay
    socket.on("chat:message", ({ roomId, message }) => {
      socket.to(roomId).emit("chat:message", message);
    });

    socket.on("disconnect", () => {
      const { roomId, peerId } = socket.data || {};
      if (roomId && peerId) {
        socket.to(roomId).emit("room:peer-left", { peerId });
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Peerly Socket.IO Signaling Server active on http://${hostname}:${port}`);
  });
});
