import type { DataSourceOptions, NamingStrategyInterface } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import User from "../entity/User";

import {
  DB_DATABASE,
  DB_HOST,
  DB_PASS,
  DB_PORT,
  DB_USER,
  MODE,
} from "../util/global";

// mariadb informations
// const { DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_DATABASE } = process.env;

const mariaConf: DataSourceOptions & {
  namingStrategy: NamingStrategyInterface;
} = {
  type: "mariadb",
  username: DB_USER,
  password: DB_PASS,
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_DATABASE,
  entities: [User],
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
  subscribers: [],
  logger: "advanced-console",
  migrations: [],
  logging: !(MODE === "migration" || MODE === "production") && "all",
  timezone: "+00:00",
};
export default mariaConf;
