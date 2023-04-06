import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { DataSource } from "typeorm";
import User from "../entity/User";
import mariaConf from "./maria.conf";

async function mariadbConnection(
  fastify: FastifyInstance,
  options: any,
  done: Function
) {
  try {
    const connectionOptions = new DataSource(mariaConf);
    connectionOptions
      .initialize()
      .then(() => {
        console.log("connection initialized");
      })
      .catch((err) => {
        console.log("initialize error", err);
      });
    fastify.decorate("db", {
      user: connectionOptions.getRepository(User),
    });
  } catch (e) {
    console.log("decorate error", e);
  }
}

export default fp(mariadbConnection);
