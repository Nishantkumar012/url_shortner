import {Request,Response,NextFunction} from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../common/error";

 declare global{

    namespace Express{
        export interface Request{
            userId? : string
        }
    }
 }



 export const authGuard = (req:Request,res:Response,next:NextFunction)=>{
         
      const header = req.headers.authorization;
      if (!header || !header.startsWith("Bearer ")) {
    throw new AppError(401, "Unauthorized");
}

      const token = header?.split(" ")[1];
        
      if(!token){
            
         throw new AppError(401, "Unauthorized");
      }
      const decoded = verifyAccessToken(token)
      console.log("decoded token in auth is", decoded);
        req.userId = decoded.sub;

     next();
 }