import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createHttpApp } from "./server/httpApp";
import { getGenerativeLanguageBidiUrl } from "./lib/googleGemini";

// Load dotenv only in development
if (process.env.NODE_ENV !== "production") {
  const dotenv = await import("dotenv");
  dotenv.config();
}

const app = createHttpApp();
const server = createServer(app);

// Legacy/Basic WebSocket setup
const legacyWss = new WebSocketServer({ noServer: true });
legacyWss.on("connection", (ws) => {
  ws.on("message", () => {
    ws.send(JSON.stringify({ status: "acknowledged", message: "Legacy WS active" }));
  });
});

const multimodalWss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  const { pathname } = new URL(request.url || "", `http://${request.headers.host}`);

  if (pathname === "/ws/multimodal-live") {
    multimodalWss.handleUpgrade(request, socket, head, (ws) => {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        ws.close(1008, "API Key missing");
        return;
      }
      const googleWsUrl = getGenerativeLanguageBidiUrl(apiKey);
      const googleWs = new WebSocket(googleWsUrl);
      googleWs.on("message", (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
      });
      ws.on("message", (data) => {
        if (googleWs.readyState === WebSocket.OPEN) googleWs.send(data.toString());
      });
      const cleanup = () => {
        if (googleWs.readyState <= 1) googleWs.close();
        if (ws.readyState <= 1) ws.close();
      };
      googleWs.on("close", cleanup);
      ws.on("close", cleanup);
      googleWs.on("error", cleanup);
      ws.on("error", cleanup);
    });
  } else if (pathname === "/ws/live") {
    legacyWss.handleUpgrade(request, socket, head, (ws) => {
      legacyWss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

const PORT = parseInt(process.env.PORT || "8080", 10);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
