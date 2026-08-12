import express , {type Express} from "express";
import { healthRouter } from "../routes/health";
import { applyMiddlewares } from "../middlewares";
import { errorHandler } from "../middlewares/errorHandler";
import {authRoutes} from "../modules/auth/authRoutes"
import {urlRoutes} from "../modules/url/urlRoutes"
import {analyticsRoutes} from "../modules/analytics/analyticsRoutes"
import {adminRoutes} from "../modules/admin/adminRoutes"


export const app: Express = express();


applyMiddlewares(app);
// app.use(healthRouter);

app.use("/", healthRouter);
app.use("/auth", authRoutes)
app.use("/url", urlRoutes)
app.use("/analytics", analyticsRoutes)
app.use("/admin", adminRoutes)
app.use(errorHandler);   // MUST be last

