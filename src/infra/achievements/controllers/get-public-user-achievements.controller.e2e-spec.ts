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

describe('GetPublicUserAchievements (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let publicCookies: string[];
  let privateCookies: string[];

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;

    publicCookies = await signUpAndGetCookies(
      server,
      'pub-ach@example.com',
      'pub_ach',
    );

    await request(server)
      .post('/api/v1/payments')
      .set('Cookie', publicCookies)
      .send({ amountInCents: 10000 });

    privateCookies = await signUpAndGetCookies(
      server,
      'priv-ach@example.com',
      'priv_ach',
    );

    await request(server)
      .patch('/api/v1/users/me/settings/privacy')
      .set('Cookie', privateCookies)
      .send({ showAchievements: false });
  });

  afterAll(async () => {
    await app.close();
  });

  it('[GET] /api/v1/users/:username/achievements → 404 for unknown username', async () => {
    const response = await request(server).get(
      '/api/v1/users/nobody_here/achievements',
    );

    expect(response.status).toBe(404);
  });

  it('[GET] /api/v1/users/:username/achievements → 200 for a public profile', async () => {
    const response = await request(server).get(
      '/api/v1/users/pub_ach/achievements',
    );

    expect(response.status).toBe(200);
    expect(response.body.definitions).toHaveLength(
      achievementDefinitions.length,
    );
    expect(response.body.unlockedIds).toEqual(
      expect.arrayContaining(['first-purchase', 'sheesh']),
    );
  });

  it('[GET] /api/v1/users/:username/achievements → 403 when showAchievements is false', async () => {
    const response = await request(server).get(
      '/api/v1/users/priv_ach/achievements',
    );

    expect(response.status).toBe(403);
  });
});
