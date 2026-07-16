import {Redis} from "ioredis";
import {env} from "../config/env";
import { logger} from "./logger";


// maxRetriesPerRequest: null is REQUIRED so BullMQ can reuse this connection
// for its blocking worker commands later.
export const redis = new Redis(env.REDIS_URL, {
     maxRetriesPerRequest: null,
})


redis.on("error", (err) => logger.error({ err }, "Reddis Connection error"))