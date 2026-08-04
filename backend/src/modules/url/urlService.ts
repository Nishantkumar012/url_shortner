import { prisma } from "../../utils/prisma";
import { generateUniqueShortCode, isAvailable } from "../../utils/shortCode";
import { isReservedWord } from "../../utils/reservedWords";
import { AppError } from "../../common/error";
import { Prisma } from "@prisma/client";
import ms, { type StringValue} from "ms"
import {redis} from "../../core/redis"


// Creates a URL for the given owner. If `alias` is supplied it becomes the
// short code (after reserved-word + uniqueness checks); otherwise a random
// unique code is generated. The DB `@unique` on shortCode is the final safety
// net against race conditions.
export async function createUrl(
  originalUrl: string,
  userId: string,
  alias?: string,
  expiresAt?: string
) {
  let shortCode: string;

  if (alias) {
    if (isReservedWord(alias)) {
      throw new AppError(400, "This alias is reserved");
    }
    if (!(await isAvailable(alias))) {
      throw new AppError(409, "This alias is already taken");
    }
    shortCode = alias;
  } else {
    shortCode = await generateUniqueShortCode();
  }
    
    const expires = expiresAt? new Date(Date.now() + ms(expiresAt as StringValue)):null;
  try {
     const url =await prisma.url.create({
      data: { originalUrl, shortCode, userId ,expiresAt:expires},
    }); 

       await  redis.set(`url:${shortCode}`,JSON.stringify({
          originalUrl,
          expiresAt:expires,
      }))
          
      // const red = await redis.get(`url:${shortCode}`)
      // console.log("red is",red);

    return url;
  } catch (err) {
    // Race-condition safety: a concurrent create could have claimed the code
    // between our check and the insert. For an auto-generated code we retry
    // with a fresh one; for a user alias we surface the conflict.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      if (alias) {
        throw new AppError(409, "This alias is already taken");
      }
      const code = await generateUniqueShortCode();
      return prisma.url.create({ data: { originalUrl, shortCode: code, userId } });
    }
    throw err;
  }
}

// Updates the destination of a URL. Scoped to the owner so a user can only
// edit their own links.
export async function updateUrl(
  shortCode: string,
  userId: string,
  newOriginalUrl: string
) {
  const existing = await prisma.url.findFirst({ where: { shortCode, userId } });
  if (!existing) {
    throw new AppError(404, "URL not found");
  }

  return prisma.url.update({
    where: { id: existing.id },
    data: { originalUrl: newOriginalUrl },
  });
}

// Deletes a URL. Scoped to the owner.
export async function deleteUrl(shortCode: string, userId: string) {
  const existing = await prisma.url.findFirst({ where: { shortCode, userId } });
  if (!existing) {
    throw new AppError(404, "URL not found");
  }

  return prisma.url.delete({ where: { id: existing.id } });
}



export async function getAllUrl(userId:string){
    
     const existing = await prisma.user.findUnique({
         where: {
            id:userId
         },
         select:{
           urls:true
         }
     })

       if(!existing){
           throw new AppError(404, "User not found");
       } 

        console.log("correct urls ",existing)

      return existing 
}
