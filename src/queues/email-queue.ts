import { Queue } from "bullmq";
import { redisClient } from "../configs/redis-config";

export const emailQueue = new Queue("email-queue", {
  connection: redisClient,
});
