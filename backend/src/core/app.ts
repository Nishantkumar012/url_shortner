import express , {type Express} from "express";
import { healthRouter } from "../routes/health";
import { applyMiddlewares } from "../middlewares";
import { errorHandler } from "../middlewares/errorHandler";


export const app: Express = express();


applyMiddlewares(app);
app.use(healthRouter);
app.use(errorHandler);   // MUST be last

app.use("/", healthRouter);

