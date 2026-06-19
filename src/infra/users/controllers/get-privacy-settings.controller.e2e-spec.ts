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

describe('GetPrivacySettings (E2E)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('[GET] /api/v1/users/me/settings/privacy → 401 when unauthenticated', async () => {
    const response = await request(server).get(
      '/api/v1/users/me/settings/privacy',
    );
    expect(response.status).toBe(401);
  });

  it('[GET] /api/v1/users/me/settings/privacy → 200 with default privacy settings', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'get-privacy@example.com',
      'get_privacy',
    );

    const response = await request(server)
      .get('/api/v1/users/me/settings/privacy')
      .set('Cookie', cookies);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      publicProfile: true,
      showTotalPaid: true,
      showAchievements: true,
      showActivity: true,
    });
  });

  it('[GET] /api/v1/users/me/settings/privacy → only returns the requesting user settings', async () => {
    const cookiesA = await signUpAndGetCookies(
      server,
      'get-privacy-a@example.com',
      'get_privacy_a',
    );
    await signUpAndGetCookies(
      server,
      'get-privacy-b@example.com',
      'get_privacy_b',
    );

    const response = await request(server)
      .get('/api/v1/users/me/settings/privacy')
      .set('Cookie', cookiesA);

    expect(response.status).toBe(200);
    expect(response.body.publicProfile).toBe(true);
  });
});
