"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_config_1 = require("../configs/redis-config");
exports.emailQueue = new bullmq_1.Queue("email-queue", {
    connection: redis_config_1.redisClient,
});
