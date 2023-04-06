import Swagger from "@fastify/swagger";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import path from "path";

async function SwaggerDocument(
  fastify: FastifyInstance,
  options: any,
  done: Function
) {
  // fastify.register(Swagger, swaggerJson as FastifyDynamicSwaggerOptions);
  fastify.register(Swagger, {
    // json 또는 yml 파일 불러와서 api 생성하는 방식
    // mode: "static",
    // specification: {
    //   path: path.resolve() + "/src/documentation/swagger.yaml",
    //   baseDir: "./",
    // },
    swagger: {
      swagger: "2.0",
      info: {
        title: "Medience Swagger Test",
        description: "Testing the Fastify swagger API",
        version: "0.0.1",
      },
      host: "localhost:4000",
      schemes: ["http"],
      consumes: ["application/json"],
      produces: ["application/json"],
      tags: [{ name: "user", description: "User related end-points" }],
      definitions: {
        User: {
          id: "User",
          type: "object",
          properties: {
            id: { type: "integer", description: "user pk" },
            uid: { type: "integer", description: "user id" },
            pw: { type: "string", description: "user password" },
            name: { type: "string", description: "user name" },
            nickname: { type: "string", description: "user nickname" },
            birth: {
              type: "string",
              description: "user birth day",
              format: "date",
            },
            gender: { type: "number", description: "user gender" },
            phone: { type: "string", description: "user phone number" },
            email: { type: "string", description: "user email" },
            region: { type: "string", description: "user region" },
            address: { type: "string", description: "user address" },
            // sign_in_path: { type: "string", description: "user sign_in_path" },
            created_at: {
              type: "string",
              format: "date",
              description: "create time",
            },
            updated_at: {
              type: "string",
              format: "date",
              description: "update time",
            },
          },
        },
        Terms: {
          type: "object",
          properties: {
            id: { type: "integer", description: "이용약관 pk" },
            over_i4: { type: "boolean", description: "14세 이상" },
            service: { type: "boolean", description: "서비스 이용 동의" },
            personal: { type: "boolean", description: "개인정보 제공 동의" },
            third_party: { type: "boolean", description: "제3자 제공 동의" },
            user_id: { type: "integer", description: "사용자 기본키 fk" },
          },
        },
      },
    },
  });
}

export default fp(SwaggerDocument);
