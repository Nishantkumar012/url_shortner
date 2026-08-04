
import { startServer } from "./core/server";
import { analyticsWorker } from "./workers/analyticsWorker";

// Keep a reference so the BullMQ worker boots with the app.
void analyticsWorker;

startServer();