
import type { Express } from "express";
import express from "express";
import cookieParser from "cookie-parser";
import { helmetMiddleware } from "./helmet";
import { corsMiddleware } from "./cors";
import { requestLogger } from "./requestLogger";

export function applyMiddlewares(app: Express) {
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(requestLogger);
  app.use(express.json());
  app.use(cookieParser());
}