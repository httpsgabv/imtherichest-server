import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import { achievementDefinitions } from '#domain/achievements/data/achievement-definitions.js';
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

describe('GetUserAchievements (E2E)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('[GET] /api/v1/users/me/achievements → 401 when unauthenticated', async () => {
    const response = await request(server).get('/api/v1/users/me/achievements');

    expect(response.status).toBe(401);
  });

  it('[GET] /api/v1/users/me/achievements → 200 returns definitions and register unlocks', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'my-ach@example.com',
      'my_ach',
    );

    const response = await request(server)
      .get('/api/v1/users/me/achievements')
      .set('Cookie', cookies);

    expect(response.status).toBe(200);
    expect(response.body.definitions).toHaveLength(
      achievementDefinitions.length,
    );
    // verified-email + first-login unlock on register.
    expect(response.body.unlockedIds).toEqual(
      expect.arrayContaining(['verified-email', 'first-login']),
    );
  });

  it('[GET] /api/v1/users/me/achievements → reflects achievements unlocked by a payment', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'my-ach-pay@example.com',
      'my_ach_pay',
    );

    await request(server)
      .post('/api/v1/payments')
      .set('Cookie', cookies)
      .send({ amountInCents: 10000 });

    const response = await request(server)
      .get('/api/v1/users/me/achievements')
      .set('Cookie', cookies);

    expect(response.status).toBe(200);
    expect(response.body.unlockedIds).toEqual(
      expect.arrayContaining(['first-purchase', 'sheesh']),
    );
  });
});
