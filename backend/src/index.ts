import { WebSocketServer, WebSocket } from "ws";
import https from "https";
import fs from "fs";
import path from "path";

const server = https.createServer({
  cert: fs.readFileSync(path.join(__dirname,"../../certificate.pem")), 
  key: fs.readFileSync(path.join(__dirname, "../../private-key.pem")), 
});

const wss = new WebSocketServer({ server });

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on("connection", function connection(ws: WebSocket) {
  ws.on("error", console.error);

  ws.on("message", function message(data: any) {
    const message = JSON.parse(data);
    if (message.type === "sender") {
      senderSocket = ws;
      console.log("Sender set");
    } else if (message.type === "receiver") {
      receiverSocket = ws;
      console.log("Receiver set");
    } else if (message.type === "createOffer") {
      receiverSocket?.send(JSON.stringify({ type: "createOffer", sdp: message.sdp }));
      console.log("Offer sent");
    } else if (message.type === "createAnswer") {
      senderSocket?.send(JSON.stringify({ type: "createAnswer", sdp: message.sdp }));
      console.log("Answer sent");
    } else if (message.type === "iceCandidate") {
      if (senderSocket === ws) {
        receiverSocket?.send(JSON.stringify({ type: "iceCandidate", candidate: message.candidate }));
        console.log("Ice candidate sent");
      } else {
        senderSocket?.send(JSON.stringify({ type: "iceCandidate", candidate: message.candidate }));
        console.log("Ice candidate sent");
      }
    }
  });
});

server.listen(8080);
