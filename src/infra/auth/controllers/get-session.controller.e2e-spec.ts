import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import { createNestApp } from '../../../../test/create-nest-app.js';

async function signUpAndGetCookies(
  server: Server,
  email: string,
): Promise<string[]> {
  const res = await request(server).post('/api/v1/auth/sign-up/email').send({
    name: 'Test User',
    email,
    password: '12345678',
  });
  return res.headers['set-cookie'] as unknown as string[];
}

describe('GetSession (E2E)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('[GET] /api/v1/auth/get-session → 200 with user and session when authenticated', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'get-session-success@example.com',
    );

    const response = await request(server)
      .get('/api/v1/auth/get-session')
      .set('Cookie', cookies);

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      name: 'Test User',
      email: 'get-session-success@example.com',
      emailVerified: false,
    });
    const session = response.body.session as {
      id: string;
      expiresAt: string;
      createdAt: string;
      updatedAt: string;
    };
    expect(session.id).toBeDefined();
    expect(session.expiresAt).toBeDefined();
    expect(session.createdAt).toBeDefined();
    expect(session.updatedAt).toBeDefined();
  });

  it('[GET] /api/v1/auth/get-session → 401 when no session cookie is provided', async () => {
    const response = await request(server).get('/api/v1/auth/get-session');

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('SESSION_NOT_FOUND');
  });

  it('[GET] /api/v1/auth/get-session → 401 when session cookie is invalid', async () => {
    const response = await request(server)
      .get('/api/v1/auth/get-session')
      .set('Cookie', 'better-auth.session_token=invalid-token-xyz');

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('SESSION_NOT_FOUND');
  });
});
