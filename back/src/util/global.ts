import dotenv from "dotenv";
import path from "path";

export type NODE_ENV_VAL = "migration" | "development" | "production" | "test";

export const MODE = process.env.NODE_ENV as NODE_ENV_VAL;

dotenv.config({
  path: path.join(path.resolve(), ".env"),
});
dotenv.config({
  path: path.join(path.resolve(), `.env.${MODE}`),
});

export const HOST = process.env.HOST || "0.0.0.0";
export const PORT = Number(process.env.PORT) || 5000;

/* pagination intialize */
export const PAGE_LIMIT = 5;
export const BASE_PAGE = 1;

/* database */
export const { DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_DATABASE } = process.env;

/* hmac */
export const ACCESS_KEY = process.env.ACCESS_KEY;
export const SECRET_KEY = process.env.SECRET_KEY;
