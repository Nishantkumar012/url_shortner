import { Queue } from "bullmq";
import { redis } from "./redis"
import { connect } from "node:http2";



export const emailQueue = new Queue("email", { connection: redis});
export const analyticsQueue = new Queue("analytics", { connection: redis});