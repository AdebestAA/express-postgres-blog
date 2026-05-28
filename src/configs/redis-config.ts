import Redis from "ioredis";

import { redisUrl } from "../constants";

export const redisClient = new Redis(redisUrl);

// const tryOut = async () => {
//   await redis.set("foo", "bar");
// };
