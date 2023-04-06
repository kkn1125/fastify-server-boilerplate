import path from "path";
import { ColumnOptions } from "typeorm";
import { MODE } from "./global";

const dev: any = function () {};
const prefix = "Server";
dev.alias = function (prefix: string) {
  dev.prefix = prefix;
  return dev;
};

Object.assign(
  dev,
  Object.fromEntries(
    Object.entries(console).map(([key, value]) => {
      const wrap = function (...arg: any[]) {
        value.call(
          console,
          `🚀 [${dev.prefix || prefix || "DEV"}]\n`,
          ...arg,
          `(${(function () {
            const time = new Date();
            const h = time.getHours();
            const m = time.getMinutes();
            const s = time.getSeconds();
            const ms = time.getMilliseconds();
            return `${h.toString().padStart(2, "0")}:${m
              .toString()
              .padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms
              .toString()
              .padStart(3, "0")}`;
          })()})`
        );
        dev.prefix = "";
      };
      if (key === "memory") {
        return [key, value];
      }
      return [key, MODE === "development" ? wrap.bind(console) : () => {}];
    })
  )
);
const capitalize = (words: string) =>
  words[0].toUpperCase() + words.slice(1).toLowerCase();
export { dev, capitalize };

const isJsonable = (data: any) => {
  if (data instanceof Object) {
    Object.assign(data, customParser(data));
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return false;
  }
};

export const customParser = (object: any) => {
  const temp: { [key: string]: any } = {};
  Object.entries(object).forEach(([k, v]) => {
    const parse = k.match(/([\w\W]+)((\[[\w\W]+\])|(\.[\w\W]+))/);
    if (parse) {
      const [a, b, c] = parse;
      if (!temp[b]) temp[b] = {};
      const convert = isJsonable(v);
      Object.assign(temp[b] || {}, {
        [c.replace(/[^\w]+/g, "")]: convert || v,
      });
      delete object[k];
    } else {
      const convert = isJsonable(v) || v;
      Object.assign(temp, {
        [k]: convert,
      });
    }
  });
  return temp;
};

export const isNotNullish = (value: any) =>
  value !== null && value !== undefined;

export const SALT_ROUNDS = 10;

const detectSeparatorInUserOs = () => {
  const userOs = {
    win: false,
    osx: false,
    nix: false,
  };
  if (process.platform.match(/^win/i)) {
    userOs.win = true;
    return "\\";
  } else if (process.platform.match(/darwin/g)) {
    userOs.osx = true;
    return "/";
  } else if (process.platform.match(/linux/g)) {
    userOs.nix = true;
    return "/";
  } else {
    return "/";
  }
  // return userOs;
};
export const FILE_UPLOAD_PATH = (...subpath: string[]) =>
  path
    .join("public", "uploads", ...subpath)
    .replace(/(\/|\\)+/g, detectSeparatorInUserOs());

export const FILE_DOWNLOAD_PATH = (type: string, filename: string) =>
  path
    .join("resources", "download", type, filename)
    .replace(/(\/|\\)+/g, detectSeparatorInUserOs());

export const dateFormat = (date: Date, format?: string) =>
  format
    ? format.replace(/YYYY|MM|dd|HH|mm|ss|SSS|AP/g, ($1: string) => {
        const hour = date.getHours();
        switch ($1) {
          case "YYYY":
            return date.getFullYear().toString().padStart(2, "0");
          case "MM":
            return (date.getMonth() + 1).toString().padStart(2, "0");
          case "dd":
            return date.getDate().toString().padStart(2, "0");
          case "HH":
            return hour.toString().padStart(2, "0");
          case "mm":
            return date.getMinutes().toString().padStart(2, "0");
          case "ss":
            return date.getSeconds().toString().padStart(2, "0");
          case "SSS":
            return date.getMilliseconds().toString().padStart(3, "0");
          case "AP":
            return hour > 12 ? "PM" : "AM";
          default:
            return $1;
        }
      })
    : `${date.getFullYear().toString().padStart(2, "0")}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}T${date
        .getHours()
        .toString()
        .padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${date
        .getSeconds()
        .toString()
        .padStart(2, "0")}.${date
        .getMilliseconds()
        .toString()
        .padStart(3, "0")}Z`;

export const getRealPath = (routerPath: string, path: string) => {
  const maxString = routerPath.length > path.length ? routerPath : path;
  let build = "";
  for (let i = 0; i < maxString.length; i++) {
    if (routerPath.charAt(i) === path.charAt(i)) {
      build += maxString.charAt(i);
    } else {
      break;
    }
  }
  return build;
};

// console.log(MODE);
export const timeSetting = (isAuto = false): ColumnOptions => {
  return {
    type: "timestamp",
    transformer: {
      from(value) {
        dev.log(`${isAuto ? "auto" : "non auto"} from`, value);
        return value;
      },
      to(value) {
        dev.log("to", value);
        return value;
      },
    },
  };
};
