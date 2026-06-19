import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '#generated/prisma/client.js';

config({ path: '.env', override: true });
config({ path: '.env.test', override: true });

// Force test mode so throttler and BetterAuth rate limit are disabled.
process.env.NODE_ENV = 'test';

const schemaId = randomUUID();
const baseUrl = new URL(process.env.DATABASE_URL!);
baseUrl.searchParams.set('schema', schemaId);
const databaseURL = baseUrl.toString();

// Set the UUID schema URL before any test file static imports are evaluated,
// so prisma.client.ts reads the isolated schema URL when the module first loads.
process.env.DATABASE_URL = databaseURL;

beforeAll(() => {
  execSync('pnpm prisma migrate deploy', {
    env: { ...process.env },
    stdio: 'inherit',
  });
});

afterAll(async () => {
  const adapter = new PrismaPg({ connectionString: databaseURL });
  const prisma = new PrismaClient({ adapter });

  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);
  await prisma.$disconnect();
});
