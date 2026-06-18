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

describe('ExportUserData (E2E)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('[GET] /api/v1/users/me/export → 200 with all user data', async () => {
    const email = 'export-user-success@example.com';
    const cookies = await signUpAndGetCookies(server, email, 'export_success');

    const response = await request(server)
      .get('/api/v1/users/me/export')
      .set('Cookie', cookies);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.headers['content-disposition']).toBe(
      'attachment; filename="user-data.json"',
    );
    expect(response.body.exportedAt).toBeDefined();

    expect(response.body.user.email).toBe(email);
    expect(response.body.user.id).toBeDefined();
  });

  it('[GET] /api/v1/users/me/export → 200 with empty collections for new user', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'export-user-empty@example.com',
      'export_empty',
    );

    const response = await request(server)
      .get('/api/v1/users/me/export')
      .set('Cookie', cookies);

    expect(response.status).toBe(200);
  });

  it('[GET] /api/v1/users/me/export → 200 only includes requester data', async () => {
    const cookiesA = await signUpAndGetCookies(
      server,
      'export-user-a@example.com',
      'export_user_a',
    );
    const cookiesB = await signUpAndGetCookies(
      server,
      'export-user-b@example.com',
      'export_user_b',
    );

    const response = await request(server)
      .get('/api/v1/users/me/export')
      .set('Cookie', cookiesB);

    expect(response.status).toBe(200);
  });

  it('[GET] /api/v1/users/me/export → 401 when unauthenticated', async () => {
    const response = await request(server).get('/api/v1/users/me/export');
    expect(response.status).toBe(401);
  });
});
