import {Type} from "@sinclair/typebox";
import Fastify from "fastify";
import path from "path";
import {
  isGameServerConnected,
  startGameServer,
  stopGameServer,
  killGameServer,
} from "./gameServer.js";
import "dotenv";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

console.log("beginning of server.ts");

const fastify = Fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();

fastify.register(import("@fastify/static"), {
  root: path.resolve("public"),
  prefix: "/web/",
});
fastify.register(import("@fastify/jwt"), {
  secret: process.env.JWT_SECRET ?? "secret",
})
fastify.register(import("@fastify/websocket"));

const logSockets = new Set<WebSocket>();
function broadcast(type: string, message: string) {
  logSockets.forEach((socket) => {
    socket.send(
      JSON.stringify({
        type,
        message,
      })
    );
  });
}

fastify.after(() => {
  fastify.get("/api/status", (request, reply) => {
    reply.send({ connected: isGameServerConnected() });
  });

  fastify.post("/api/start", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (e) {
      reply.status(401).send({ message: "unauthorized" });
      return;
    }
    broadcast("req", "시작 요청");
    startGameServer(broadcast);
    reply.send();
  });

  fastify.post("/api/stop", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (e) {
      reply.status(401).send({ message: "unauthorized" });
      return;
    }
    broadcast("req", "정지 요청");
    stopGameServer(broadcast);
    reply.send();
  });

  fastify.post("/api/auth", {
    schema: {
      body: Type.Object({
        username: Type.String(),
        password: Type.String(),
      })
    }
  }, async (request, reply) => {
    const { username, password } = request.body;
    if (username === "admin" && password === process.env.ADMIN_PASSWORD) {
      reply.status(401).send({ message: "invalid username or password" });
      return;
    }
    const token = fastify.jwt.sign({ username }, { expiresIn: "1h" });
    reply.send({ token });
  });

  fastify.get("/ws/log", { websocket: true }, (connection) => {
    fastify.log.info("open log socket");
    logSockets.add(connection.socket);
    const intervalId = setInterval(() => {
      connection.socket.send(
        JSON.stringify({
          type: "ping",
          message: "ping",
        })
      );
    }, 30000);
    connection.socket.on("close", () => {
      logSockets.delete(connection.socket);
      clearInterval(intervalId);
      fastify.log.info("close log socket");
    });
  });

  fastify.get("/ws/status", { websocket: true }, (connection) => {
    fastify.log.info("open status socket");
    const intervalId = setInterval(() => {
      connection.socket.send(isGameServerConnected() ? "on" : "off");
    }, 5000);
    connection.socket.on("close", () => {
      clearInterval(intervalId);
      fastify.log.info("close status socket");
    });
  });

  fastify.addHook("onClose", async () => {
    stopGameServer(broadcast);
  });
});

fastify.listen({ port: 3003, host: "0.0.0.0" }).catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});

process.on('exit', function() {
  killGameServer();
  console.log('exiting...');
});
