
import cors from "cors";
import { env } from "../config/env";


// Dev: reflect any origin. Production: set your frontend origin explicitly.
export const corsMiddleware = cors({
  origin: env.NODE_ENV === "production" ? "https://url-shortner-q9yd.onrender.com" : true,
  credentials: true,
});