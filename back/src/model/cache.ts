export default class Cache {
  static expiredTime = 1000 * 60 * 10;
  static usedCacheCountGap = 5;
  header: string;
  subKey: string;
  cached: object;
  count: number;
  expiredIn: number;
  latestAccessAt: number;

  constructor(header: string, subKey: object | string, cached?: object) {
    this.header = header;
    this.subKey = typeof subKey === "string" ? subKey : JSON.stringify(subKey);
    this.cached = cached || {};
    this.count = 1;
    this.expiredIn = Date.now() + Cache.expiredTime;
    this.latestAccessAt = Date.now();
  }

  countUp() {
    this.count += 1;
  }
  
  updateAccessTime() {
    this.latestAccessAt = Date.now();
  }

  static copy(cache: Cache) {
    return Object.assign(new Cache("", ""), cache);
  }

  insert(key: keyof Cache, value: any) {
    Object.assign(this[key], value);
    return this;
  }
}
