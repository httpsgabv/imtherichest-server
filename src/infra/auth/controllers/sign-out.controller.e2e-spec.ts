import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import { createNestApp } from '../../../../test/create-nest-app.js';

async function signUpAndGetCookies(
  server: Server,
  email: string,
  username: string,
): Promise<string[]> {
  const res = await request(server).post('/api/v1/auth/sign-up/email').send({
    username,
    email,
    password: '12345678',
  });
  return res.headers['set-cookie'] as unknown as string[];
}

describe('SignOut (E2E)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('[POST] /api/v1/auth/sign-out → 200 with success and clears session cookie', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'sign-out-success@example.com',
      'signout_success',
    );

    const response = await request(server)
      .post('/api/v1/auth/sign-out')
      .set('Cookie', cookies);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('[POST] /api/v1/auth/sign-out → 200 even when no session cookie is present', async () => {
    const response = await request(server).post('/api/v1/auth/sign-out');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('[POST] /api/v1/auth/sign-out → session is invalidated after sign-out', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'sign-out-invalidate@example.com',
      'signout_inv',
    );

    await request(server).post('/api/v1/auth/sign-out').set('Cookie', cookies);

    const sessionResponse = await request(server)
      .get('/api/v1/auth/get-session')
      .set('Cookie', cookies);

    expect(sessionResponse.status).toBe(401);
    expect(sessionResponse.body.code).toBe('SESSION_NOT_FOUND');
  });
});
