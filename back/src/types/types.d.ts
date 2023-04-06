import {
  FastifyBaseLogger,
  FastifyLoggerOptions,
  FastifyServerOptions,
} from "fastify";
import { PinoLoggerOptions } from "fastify/types/logger";
import { IncomingMessage, Server, ServerResponse } from "http";
import { FindOptionsWhere, TypeORMError } from "typeorm";

export declare type ENV_LOGGER_TYPE =
  | boolean
  | FastifyServerOptions<
      Server<typeof IncomingMessage, typeof ServerResponse>,
      FastifyBaseLogger
    >
  | (FastifyLoggerOptions & PinoLoggerOptions)
  | undefined;
export declare interface ENV_LOGGER {
  development: ENV_LOGGER_TYPE;
  production: ENV_LOGGER_TYPE;
  test: ENV_LOGGER_TYPE;
}

export declare type ErrorMessage = any | TypeORMError | Error;

export declare interface LoginBodyType {
  key: string;
  message: string;
}

export declare interface QueryOptionType {
  limit: number;
  exact: boolean;
  page: number;
}

declare interface UploadFile {
  data: Buffer;
  filename: string;
  encoding: string;
  mimetype: string;
  limit: boolean;
}

export interface Authorization {
  auth?: {
    realPath?: string;
    hash?: string;
  };
}

export declare type WhereType<T> = FindOptionsWhere<T> | FindOptionsWhere<T>[];
