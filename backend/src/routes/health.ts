import {Router} from "express";
import {prisma} from "../utils/prisma";
import {redis} from "../core/redis"



export const healthRouter  = Router();

// Liveness — is the process up?
healthRouter.get("/healthz", (req,res)=>{
     res.json({status: "ok"});
});


healthRouter.get("/", (req, res) => {
  res.send("Hello World");
});


// Readiness — can we reach our dependencies?
healthRouter.get("/readyz", async (req,res)=>{
     
      try {
           await prisma.$queryRawUnsafe("SELECT 1");;
           await redis.ping();
           res.json({status:"ok", db:"up", redis:"up"});
      } catch (error) {
           res.status(503).json({ status:"error", detail: String(error)});
      }
})

