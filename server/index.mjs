import fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { WebSocketServer, WebSocket } from "ws";

const generateUserID = () => "_" + Math.random().toString(36).substring(2);

const server = fastify();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
server.register(fastifyStatic, {
  root: join(__dirname, "../dist"),
});

server.post("/users", async (request, reply) => {
  const userName = request.body.userName;
  const userID = generateUserID();

  reply.status(200).send({ userID, userName });
});

const wss = new WebSocketServer({ server: server.server });

wss.on("connection", (ws) => {
  console.log("WebSocket is connected");

  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());

    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });
});

const port = process.env.PORT || 5500;
const host = process.env.HOST || "127.0.0.1";
server
  .listen({ port, host })
  .then((address) => {
    console.log(`Server is running at ${address}`);
  })
  .catch((error) => {
    console.error(`Error starting server: ${error}`);
  });
