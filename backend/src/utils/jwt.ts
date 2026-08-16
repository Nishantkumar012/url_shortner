import jwt from "jsonwebtoken";
import { env} from "../config/env";
import type { StringValue} from "ms";
import argon2 from "argon2";
import { AppError } from "../common/error";


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

/**
 * One-time email verification token (24h). The `purpose` claim distinguishes
 * it from access tokens so the verify-email handler can reject wrong tokens.
 */
export function signEmailVerificationToken(userId: string): string {
  return jwt.sign(
    { sub: userId, purpose: "email-verification" },
    env.JWT_ACCESS_SECRET,
    { expiresIn: "24h" }
  );
}

export function verifyEmailVerificationToken(token: string): string {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
    sub: string;
    purpose: string;
  };
  if (payload.purpose !== "email-verification") {
    throw new Error("Invalid verification token");
  }
  return payload.sub;
}

export function verifyAccessToken(token: string): {sub: string}{
     
try {
    return jwt.verify(
      token,
      env.JWT_ACCESS_SECRET
    ) as { sub: string };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, "jwt expired");
    }

    throw new AppError(401, "Invalid token");
  }
}

export async  function hashToken(token:string):Promise<string>{
      
      return argon2.hash(token);
}


export async function verifyHashToken(plain:string,hashToken:string):Promise<boolean>{

      return argon2.verify(hashToken,plain);
}

export function verifyRefreshToken(token: string): { sub: string } {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string };
}