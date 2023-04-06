import User from "../entity/User";
declare module "fastify" {
  export interface FastifyInstance {
    db: {
      user: Repository<User>;
    };
    authorization: any;
    /**
     * Express middleware function
     */
    swagger: () => OpenAPI.Document<{}>;
  }
}

type FastifyExpress =
  FastifyPluginCallback<fastifyExpress.FastifyExpressOptions>;

declare namespace fastifyExpress {
  export interface FastifyExpressOptions {
    expressHook?: string;
    createProxyHandler?: (fastifyReq: FastifyRequest) => ProxyHandler<Request>;
  }

  export const fastifyExpress: FastifyExpress;
  export { fastifyExpress as default };
}

declare function fastifyExpress(
  ...params: Parameters<FastifyExpress>
): ReturnType<FastifyExpress>;
export = fastifyExpress;

export declare type DBTables = "user";
