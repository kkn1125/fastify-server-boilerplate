import SwaggerUI from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import path from "path";

async function SwaggerDocumentUI(
  fastify: FastifyInstance,
  options: any,
  done: Function
) {
  await fastify.register(SwaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
    // baseDir: path.join('/c/kkn_folder/project/medience/api_server/src/documentation', "src/documentation/swagger.json"),
  });
}

export default fp(SwaggerDocumentUI);
