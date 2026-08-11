
import { startServer } from "./core/server";
import { analyticsWorker } from "./workers/analyticsWorker";
import { emailWorker } from "./workers/emailWorker";

// Keep a reference so the BullMQ workers boot with the app.
void analyticsWorker;
void emailWorker;

startServer();