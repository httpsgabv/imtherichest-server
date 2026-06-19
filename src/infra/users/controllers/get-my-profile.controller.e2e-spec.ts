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

describe('GetMyProfile (E2E)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('[GET] /api/v1/users/me → 401 when unauthenticated', async () => {
    const response = await request(server).get('/api/v1/users/me');
    expect(response.status).toBe(401);
  });

  it('[GET] /api/v1/users/me → 200 with full profile when authenticated', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'me-profile@example.com',
      'me_profile',
    );

    const response = await request(server)
      .get('/api/v1/users/me')
      .set('Cookie', cookies);

    expect(response.status).toBe(200);
    expect(response.body.username).toBe('me_profile');
    expect(response.body.displayName).toBeDefined();
    expect(response.body.points).toBe(0);
    expect(response.body.totalPaid).toBe(0);
    expect(response.body.bio).toBe('');
    expect(response.body.country).toBe('');
    expect(response.body.avatarUrl).toBeNull();
    expect(response.body.createdAt).toBeDefined();
  });

  it('[GET] /api/v1/users/me → includes privacySettings with defaults', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'me-privacy@example.com',
      'me_privacy',
    );

    const response = await request(server)
      .get('/api/v1/users/me')
      .set('Cookie', cookies);

    expect(response.status).toBe(200);
    expect(response.body.privacySettings).toMatchObject({
      publicProfile: true,
      showTotalPaid: true,
      showAchievements: true,
      showActivity: true,
    });
  });

  it('[GET] /api/v1/users/me → includes notificationSettings with defaults', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'me-notif@example.com',
      'me_notif',
    );

    const response = await request(server)
      .get('/api/v1/users/me')
      .set('Cookie', cookies);

    expect(response.status).toBe(200);
    expect(response.body.notificationSettings).toMatchObject({
      achievementAlerts: true,
      rankAlerts: true,
      paymentConfirmations: true,
      marketingEmails: false,
    });
  });

  it("[GET] /api/v1/users/me → only returns the requesting user's profile", async () => {
    const cookiesA = await signUpAndGetCookies(
      server,
      'me-user-a@example.com',
      'me_user_a',
    );
    await signUpAndGetCookies(server, 'me-user-b@example.com', 'me_user_b');

    const response = await request(server)
      .get('/api/v1/users/me')
      .set('Cookie', cookiesA);

    expect(response.status).toBe(200);
    expect(response.body.username).toBe('me_user_a');
  });
});
