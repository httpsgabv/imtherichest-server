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

describe('GetNotificationSettings (E2E)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('[GET] /api/v1/users/me/settings/notifications → 401 when unauthenticated', async () => {
    const response = await request(server).get(
      '/api/v1/users/me/settings/notifications',
    );
    expect(response.status).toBe(401);
  });

  it('[GET] /api/v1/users/me/settings/notifications → 200 with default notification settings', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'get-notif@example.com',
      'get_notif',
    );

    const response = await request(server)
      .get('/api/v1/users/me/settings/notifications')
      .set('Cookie', cookies);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      achievementAlerts: true,
      rankAlerts: true,
      paymentConfirmations: true,
      marketingEmails: false,
    });
  });

  it('[GET] /api/v1/users/me/settings/notifications → only returns the requesting user settings', async () => {
    const cookiesA = await signUpAndGetCookies(
      server,
      'get-notif-a@example.com',
      'get_notif_a',
    );
    await signUpAndGetCookies(server, 'get-notif-b@example.com', 'get_notif_b');

    const response = await request(server)
      .get('/api/v1/users/me/settings/notifications')
      .set('Cookie', cookiesA);

    expect(response.status).toBe(200);
    expect(response.body.achievementAlerts).toBe(true);
  });
});
