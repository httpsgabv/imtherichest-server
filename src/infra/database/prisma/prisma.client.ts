import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '#generated/prisma/client.js';

function getDatabaseSchema(url: string) {
  return new URL(url).searchParams.get('schema') ?? undefined;
}

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaPg(connectionString, {
  schema: getDatabaseSchema(connectionString),
});

export const prisma = new PrismaClient({
  adapter,
});

export type AppPrismaClient = typeof prisma;
