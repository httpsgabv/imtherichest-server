import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import { PrismaService } from '#infra/database/prisma/prisma.service.js';
import { createNestApp } from '../../../../test/create-nest-app.js';

async function signUpAndGetCookies(
  server: Server,
  email: string,
): Promise<string[]> {
  const res = await request(server).post('/api/v1/auth/sign-up/email').send({
    name: 'Delete User',
    email,
    password: '12345678',
  });

  return res.headers['set-cookie'] as unknown as string[];
}

describe('DeleteUser (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: Server;

  beforeAll(async () => {
    app = await createNestApp();
    prisma = app.get(PrismaService);
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('[DELETE] /api/v1/users/me → 401 when unauthenticated', async () => {
    const response = await request(server).delete('/api/v1/users/me');

    expect(response.status).toBe(401);
  });
});
