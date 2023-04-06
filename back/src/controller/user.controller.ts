import type { FastifyRequest } from "fastify";
import { FastifyInstance } from "fastify";
import User from "../entity/User";
import { UserService } from "../service/user.service";

async function UserController(
  fastify: FastifyInstance,
  options: any,
  done: Function
) {
  const userService = new UserService(fastify.db.user);

  fastify.get("", (req: FastifyRequest<{ Body: keyof User }>, res) => {
    const { body } = req;
    userService;
    return;
  });

  done();
}

export default UserController;
