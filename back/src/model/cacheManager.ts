import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { dev } from "../util/tool";
import Cache from "./cache";
import { HttpState } from "./httpstate";

type CacheState = {
  [header: string]: Cache;
};

type CachePolicy = "EXPIRE_TIME" | "LFU";

export default class CacheManager {
  data: Map<string, CacheState> = new Map();
  policy: Map<CachePolicy, Function> = new Map();
  server: FastifyInstance;
  preDB: any;

  constructor() {
    dev.alias("Initial Cache Data").log(this.data);
  }

  static EXPIRE_TIME(this: CacheManager) {
    dev.alias("EXPIRE_TIME Policy").log("start");

    const cacheValues = Array.from(this.data.values());
    const cacheFlatValues = cacheValues.flatMap((v) => Object.values(v));
    for (let value of cacheFlatValues) {
      if (value.expiredIn < Date.now()) {
        const cache = this.data.get(value.header);
        if (cache) delete cache[value.subKey];
      }
    }

    dev.alias("EXPIRE_TIME Policy").log("end");
  }

  static LFU(this: CacheManager) {
    dev.alias("LFU Policy").log("start");
    const cacheValues = Array.from(this.data.values());
    const cacheFlatValues = cacheValues.flatMap((v) => Object.values(v));
    const counter = Object.entries(
      cacheFlatValues.reduce((acc, cur) => {
        const key = cur.header + "^" + cur.subKey;
        acc[key] = cur.count;
        return acc;
      }, {} as { [key: string]: number })
    );

    const sorting = counter.sort((a, b) => Number(a[1] < b[1]));
    const max = sorting.shift() as any[];
    const min = sorting.pop() as any[];

    if (max && min && max[1] >= min[1] + Cache.usedCacheCountGap) {
      const [header, subKey] = min[0].split("^");
      const cache = this.data.get(header);
      dev
        .alias("LFU Policy")
        .log("delete least count cache:" + header + " ^ " + subKey);
      if (cache) delete cache[subKey];
    }

    dev.alias("LFU Policy").log("end");
  }

  addServer(server: FastifyInstance) {
    this.server = server;
    this.preDB = this.server.db;
  }

  initializeDB() {
    this.preDB = undefined;
    this.data = new Map();
  }

  addPolicy(fn: Function) {
    const policyKey = fn.name as CachePolicy;
    this.policy.set(policyKey, fn);
  }

  getPolicy(policyKey: CachePolicy) {
    return this.policy.get(policyKey);
  }

  getPolicies() {
    return Array.from(this.policy.keys());
  }

  usePolicies() {
    for (let [key, policy] of this.policy.entries()) {
      dev.log(key);
      if (policy) {
        policy.call(this);
      }
    }
  }

  startCheckPolicies() {
    setInterval(() => {
      dev.alias("Cache Data").log(this.data);
      // dev
      //   .alias("Cached Content")
      //   .log(
      //     this.data.get("avatar|GET|/v1/api/avatar")?.['{"limit":5}'].cached
      //   );
      this.usePolicies();
    }, 5000);
  }

  push(req: FastifyRequest, value: any) {
    const header = this.getCacheHeader(req);
    const subKey = this.getCacheSubKey(req);
    const convertJSON = Object.assign({}, value);
    dev.alias("before push cache storage").log(this.data);
    const isExists = this.data.has(header);

    if (!isExists) {
      this.data.set(header, {});
    }

    const cache = this.data.get(header);
    if (cache) {
      if (!cache[JSON.stringify(subKey)]) {
        cache[JSON.stringify(subKey)] = new Cache(header, subKey);
      }
      const oldCache = cache[JSON.stringify(subKey)];
      const newCache = Cache.copy(oldCache).insert("cached", convertJSON);
      this.data.set(header, {
        ...cache,
        [JSON.stringify(subKey)]: newCache,
      });
      dev.alias("after push cache storage").log(this.data);
    }
  }

  pull(req: FastifyRequest, res: FastifyReply) {
    const header = this.getCacheHeader(req);
    const subKey = this.getCacheSubKey(req);
    dev.alias("before pull cache storage").log(this.data);
    dev.alias("start to verify the cache expire time").log("✅");
    const cache = this.data.get(header);
    CacheManager.EXPIRE_TIME.call(this);
    dev.alias("cache expire time verify done").log("✅");

    if (cache && this.has(header, subKey)) {
      const cacheTarget = cache[JSON.stringify(subKey)];
      cacheTarget.latestAccessAt = Date.now();

      cacheTarget.count += 1;
      return new HttpState().set(cache[JSON.stringify(subKey)].cached).end(res);
    }
    dev.alias("after pull cache storage").log(this.data);
    return false;
  }

  update(req?: FastifyRequest) {
    if (req) {
      const header = this.getCacheHeader(req);
      const [type, method, path] = header.split("|");

      if (method.match(/post|put|delete/gi) && path.match(/\/|\/:id/g)) {
        dev.log("update");
        this.data = new Map();
        this.preDB = this.server.db;
        return true;
      }

      dev.log("no update data");
      this.preDB = this.server.db;
      return false;
    } else {
      dev.log("update");
      this.data = new Map();
      this.preDB = this.server.db;
      return true;
    }
  }

  has(header: string, data: any) {
    dev.alias("has cache storage").log(this.data);
    const cache = this.data.get(header);
    return !!(
      cache &&
      this.data.has(header) &&
      cache[JSON.stringify(data)] &&
      Object.keys(cache[JSON.stringify(data)].cached).length > 0
    );
  }

  done(callback: Function) {
    callback();
  }

  getCacheHeader(req: FastifyRequest) {
    const type = req.routerPath.split("/")[3];
    const method = req.method;
    const path = req.routerPath;
    return type + "|" + method + "|" + path;
  }

  getCacheSubKey(req: FastifyRequest) {
    return {
      ...(req.query || {}),
      ...(req.params || {}),
      ...(req.body || {}),
    };
  }
}

const cacheManager = new CacheManager();

export { cacheManager };
