import type { FastifyReply } from "fastify";
import { DBTables } from "../types";

// createError
class ErrorBase {
  ok?: boolean = true;
  code?: number = 200;
  message?: object | string = undefined;
  detail?: string | object = undefined;
  constructor(
    ok?: boolean | undefined,
    code?: number,
    message?: object | string | undefined,
    detail?: string | object | undefined
  ) {
    ok && (this.ok = ok);
    code && (this.code = code);
    message && (this.message = message);
    detail && (this.detail = detail);
  }
}

export class State<T> extends ErrorBase {
  payload?: T | T[] = undefined;
  paginations?: object = undefined;
  constructor(
    ok?: boolean,
    code?: number,
    message?: object | string,
    payload?: T | T[],
    paginations?: object,
    detail?: string | object
  ) {
    super(ok, code, message, detail);
    payload !== null && payload !== undefined && (this.payload = payload);
    paginations !== null &&
      paginations !== undefined &&
      (this.paginations = paginations);
  }

  generateState() {
    return new State(
      this.ok,
      this.code,
      this.message,
      this.payload,
      this.paginations,
      this.detail
    );
  }
}

export class HttpState<T> extends State<T> {
  state: State<T> = new State<T>();
  constructor(
    ok?: boolean | undefined,
    code?: number,
    message?: object | string | undefined,
    payload?: T | T[] | undefined,
    paginations?: object | undefined
  ) {
    super(ok, code, message, payload, paginations);
  }

  set(options?: {
    ok?: boolean;
    code?: number;
    message?: object | string;
    payload?: T | T[];
    paginations?: object;
    detail?: string | object;
  }) {
    if (options) {
      const { ok, code, message, payload, paginations, detail } = options;
      ok && (this.ok = ok);
      code && (this.code = code);
      message && (this.message = message);
      detail && (this.detail = detail);
      // DONE: 페이로드 불린 값 통과 위해 로직 변경 2023-03-10 17:21:16
      payload !== null && payload !== undefined && (this.payload = payload);
      paginations !== null &&
        paginations !== undefined &&
        (this.paginations = paginations);
    }
    return this;
  }

  end(res: FastifyReply, type: "success" | "fail" = "success") {
    res.code(this.code as number);
    this.state = super.generateState();
    if ((this.code as number) > 299) this.state.ok = false;
    if (type === "success") {
      delete this.state["code"];
    }
    return this.state;
  }

  /* 2xx */
  static OK: ErrorBase = { code: 200, message: "ok" };
  static CREATED: ErrorBase = { code: 201, message: "Created" };
  static ACCEPTED: ErrorBase = { code: 202, message: "Accepted" };

  /* 4xx */
  static BAD_REQUEST: ErrorBase = { code: 400, message: "Bad Request" };
  static UNAUTHORIZED: ErrorBase = { code: 401, message: "Unauthorized" };
  static FORBIDDEN = {
    code: 403,
    message: `Forbidden`,
  };
  static NOT_FOUND = (data: any, prefix?: DBTables, label?: string) =>
    ({
      code: 404,
      message: `not found entity by ${prefix ? prefix + "_" : ""}${
        label || "id"
      }: ${data}`,
    } as ErrorBase);
  static METHOD_NOT_ALLOWED = {
    code: 405,
    message: `Method Not Allowed`,
  };
  static CONFLICT = {
    code: 409,
    message: `Duplicate`,
  };

  /* 5xx */
  static INTERNAL_SERVER: ErrorBase = {
    code: 500,
    message: "Internal Server Error",
  };
  static BAD_GATEWAY: ErrorBase = {
    code: 502,
    message: "Bad Gateway",
  };
}
