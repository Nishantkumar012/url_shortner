import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({
  adapter,
  log: [{ emit: "event", level: "error" }],
})

prisma.$on('error', (e) => {
  console.error('🔴 PRISMA ERROR:', {
    message: e?.message,
    // code: e?.code,
    type: e?.constructor?.name,
  })
})

export { prisma }