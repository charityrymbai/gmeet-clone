import { WebSocketServer, WebSocket } from "ws";
import https from "https";
import fs from "fs";
import path from "path";

const server = https.createServer({
  cert: fs.readFileSync(path.join(__dirname,"../../certificate.pem")), 
  key: fs.readFileSync(path.join(__dirname, "../../private-key.pem")), 
});

const connections = new Map<number, {sender: WebSocket | null, receiver: WebSocket | null }>();

const wss = new WebSocketServer({ server });

wss.on("connection", function (ws: WebSocket) {
  ws.on("error", console.error);

  ws.on("message", function message(data: any) {
    const message = JSON.parse(data);
    if (message.type === "sender") {
          const meetingID = message.ID;
          if (meetingID===undefined){
              console.log("error, meetingID = " + meetingID)
              return;
          }
          connections.set(meetingID, {sender: ws, receiver: null});
          console.log("sender set, meetingID = " + meetingID)
    } else if (message.type === "receiver") {
          if (connections.has(message.ID)){
              const connection = connections.get(message.ID);
              if (connection) {
                connection.receiver = ws;
                connections.set(message.ID, connection);
                connection.sender?.send(JSON.stringify({type: "receiverReady", ID: message.ID}))
                console.log(`receiver set, meetingID = ${message.ID}`)
              } else {
                console.error(`No connection found for meetingID: ${message.ID}`);
              }
          }
    } else if (message.type === "createOffer") {
          const connection = connections.get(message.ID);
          if (!connection) return;
          if(ws){
              console.log("Server: sending offer to receiver")
              connection.receiver?.send(JSON.stringify({ type: "createOffer",  ID: message.ID, sdp: message.sdp }));
              console.log("Server: Offer sent to receiver");
          }
    } else if (message.type === "createAnswer") {
          const connection = connections.get(message.ID);
          if (!connection) return;
          if (ws){
              console.log("Server: sending answer to sender")
              connection.sender?.send(JSON.stringify({ type: "createAnswer",  ID: message.ID, sdp: message.sdp }));
              console.log("Server: Answer sent to sender");
          }
    } else if (message.type === "iceCandidate") {
          const connection = connections.get(message.ID);  
        if (connection){
            if (connection.sender === ws) {
              connection.receiver?.send(JSON.stringify({ type: "iceCandidate", ID: message.ID, candidate: message.candidate }));
              console.log("sender to receiver: Ice candidate sent");
      } else {
              connection.sender?.send(JSON.stringify({ type: "iceCandidate", ID: message.ID, candidate: message.candidate }));
              console.log("receiver to sender: Ice candidate sent");
            }
      }
    } else if (message.type === "endCall") {
      const connection = connections.get(message.ID);  
        if (connection){
            if (connection.sender === ws) {
              connection.receiver?.send(JSON.stringify({ type: "endCall", ID: message.ID }));
              console.log("sender to receiver: endCall sent");
      } else {
              connection.sender?.send(JSON.stringify({ type: "endCall", ID: message.ID }));
              console.log("receiver to sender: endCall sent");
            }
      }
    }
  });
});

server.listen(8080, ()=> console.log("server running...."));
