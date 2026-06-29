"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const constants_1 = require("../constants");
exports.redisClient = new ioredis_1.default(constants_1.redisUrl);
// const tryOut = async () => {
//   await redis.set("foo", "bar");
// };
