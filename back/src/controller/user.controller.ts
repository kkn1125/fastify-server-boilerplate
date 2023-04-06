import type { FastifyRequest } from "fastify";
import { FastifyInstance } from "fastify";
import User from "../entity/User";
import { UserService } from "../service/user.service";
import { BASE_PAGE, PAGE_LIMIT } from "../util/global";
import { isNotNullish } from "../util/tool";

async function UserController(
  fastify: FastifyInstance,
  options: any,
  done: Function
) {
  const userService = new UserService(fastify.db.user);

  fastify.get(
    "/",
    (
      req: FastifyRequest<{
        Body: keyof User;
        Querystring: { page: number; limit: number; exact: boolean };
      }>,
      res
    ) => {
      const { body, query } = req;
      const {
        page = BASE_PAGE,
        limit = PAGE_LIMIT,
        exact = false,
        ...rest
      } = query;
      return userService.findAll(
        Number(page),
        Number(limit),
        isNotNullish(exact),
        rest
      );
    }
  );

  done();
}

export default UserController;
