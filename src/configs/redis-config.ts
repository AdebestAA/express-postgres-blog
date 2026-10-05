import Redis from "ioredis";

import { redisUrl } from "../constants";

export const redisClient = new Redis(redisUrl);
