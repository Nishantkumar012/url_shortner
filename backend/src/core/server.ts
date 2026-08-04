

import { createServer, type Server } from "http";
import { app } from "./app";
import { env } from "../config/env";
import { logger } from "./logger";
import { prisma } from "../utils/prisma";
import { redis } from "./redis";
import { emailQueue, analyticsQueue } from "./queue";
import { analyticsWorker } from "../workers/analyticsWorker";

const httpServer: Server = createServer(app);

export function startServer() {
  httpServer.listen(env.PORT, () => {
    
    logger.info(`Server listening on http://localhost:${env.PORT}`);
  });
}

async function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down...`);
  httpServer.close();
  await Promise.all([emailQueue.close(), analyticsQueue.close()]);
  await analyticsWorker.close();
  await prisma.$disconnect();
  await redis.quit();
  logger.info("Shutdown complete");
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
