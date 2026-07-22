import jwt from "jsonwebtoken";
import { env} from "../config/env";
import type { StringValue} from "ms";
import argon2 from "argon2";


export function signAccessToken(userId:string):string{
     
     return  jwt.sign({sub: userId},env.JWT_ACCESS_SECRET, {
         expiresIn: env.ACCESS_TOKEN_TTL as StringValue
     })
}

export function signRefreshToken(userId:string):string{
      
     return jwt.sign({sub:userId}, env.JWT_REFRESH_SECRET,{
        expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d`
     })
}

export function verifyAccessToken(token: string): {sub: string}{
     
     return jwt.verify(token,env.JWT_ACCESS_SECRET) as { sub: string}
}

export async  function hashToken(token:string):Promise<string>{
      
      return argon2.hash(token);
}


export async function verifyHashToken(plain:string,hashToken:string):Promise<boolean>{
      
      return argon2.verify(hashToken,plain);
}