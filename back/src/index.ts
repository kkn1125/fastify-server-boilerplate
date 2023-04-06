import type { FastifyInstance } from "fastify";
import Fastify from "fastify";
import type { IncomingMessage, ServerResponse } from "http";
import type { Server } from "http";
import qs from "qs";
import { ENV_LOGGER, ENV_LOGGER_TYPE } from "./types/types";
import { HOST, MODE, PORT } from "./util/global";
import multipart from "@fastify/multipart";
import cors from "@fastify/cors";
import formBody from "@fastify/formbody";
import mariadb from "./database/mariadb";
import mariaConf from "./database/maria.conf";
import { customParser } from "./util/tool";
import CacheManager, { cacheManager } from "./model/cacheManager";
import UserController from "./controller/user.controller";
import SwaggerDocument from "./documentation/document";
import SwaggerDocumentUI from "./documentation/document.ui";

const envToLogger: ENV_LOGGER = {
  development: {
    serializers: {
      res(reply) {
        // The default
        return {
          statusCode: reply.statusCode,
        };
      },
      req(request) {
        return {
          method: request.method,
          url: request.url,
          hostname: request.hostname,
          query: request.query,
          body: request.body,
        };
      },
    },
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname,reqId",
      },
    },
  },
  production: true,
  test: false,
};

const server: FastifyInstance<Server, IncomingMessage, ServerResponse> =
  Fastify({
    logger:
      !(MODE === "migration" || MODE === "production") &&
      (envToLogger[MODE] as ENV_LOGGER_TYPE),
    // querystring parser
    querystringParser(str) {
      return qs.parse(str);
    },
  });

server.register(cors, {
  // put your options here
});

server.register(multipart, {
  addToBody: true,
});

server.register(formBody, {
  parser: (str) => qs.parse(str),
});

/* Hooks handler */
server.addHook("preValidation", async (req) => {
  // Some code
  if (req.body) {
    const result = customParser(req.body);
    Object.assign(req.body, result);
  }

  /** @author 김경남 EM  / query parsing 추가 / 숫자 변환 / 2023년 03월 07일 15:14:29 */
  if (req.query) {
    const result = customParser(req.query);
    Object.assign(req.query, result);
  }
});

/* use Cache */
cacheManager.addPolicy(CacheManager.EXPIRE_TIME);
cacheManager.addPolicy(CacheManager.LFU);
cacheManager.startCheckPolicies();
cacheManager.addServer(server);

/* after response handler */
server.addHook("onSend", (req, res, payload, done) => {
  if (!req.url.match(/^\/$|\/v1\/api\/(auth|user|resources|favicon)/g)) {
    if (req.method === "GET") {
      /* NOTICE: cache 저장 */
      cacheManager.push(req, JSON.parse((payload as string) || "{}"));
    }
  }
  done();
});

try {
  server.register(mariadb, mariaConf);
} catch (error) {
  console.log("error", error);
}

server.register(SwaggerDocument);
server.register(SwaggerDocumentUI);

/* routes */
const versioning = "v1";
server.register(UserController, { prefix: `/${versioning}/api/user` });

/* main content */
server.get("/", async (req, res) => {
  res.status(200).send("no contents");
});

// Run the server!
const start = async () => {
  try {
    await server.listen({ host: HOST, port: PORT });
    await server.ready();
    server.swagger();
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
