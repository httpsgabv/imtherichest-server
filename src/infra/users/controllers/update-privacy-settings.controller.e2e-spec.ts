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

describe('UpdatePrivacySettings (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let sharedCookies: string[];

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;

    sharedCookies = await signUpAndGetCookies(
      server,
      'update-privacy-shared@example.com',
      'upd_privacy_shared',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('[PATCH] /api/v1/users/me/settings/privacy → 401 when unauthenticated', async () => {
    const response = await request(server)
      .patch('/api/v1/users/me/settings/privacy')
      .send({ publicProfile: false });

    expect(response.status).toBe(401);
  });

  it('[PATCH] /api/v1/users/me/settings/privacy → 200 with updated publicProfile', async () => {
    const response = await request(server)
      .patch('/api/v1/users/me/settings/privacy')
      .set('Cookie', sharedCookies)
      .send({ publicProfile: false });

    expect(response.status).toBe(200);
    expect(response.body.publicProfile).toBe(false);
  });

  it('[PATCH] /api/v1/users/me/settings/privacy → 200 with updated showTotalPaid', async () => {
    const response = await request(server)
      .patch('/api/v1/users/me/settings/privacy')
      .set('Cookie', sharedCookies)
      .send({ showTotalPaid: false });

    expect(response.status).toBe(200);
    expect(response.body.showTotalPaid).toBe(false);
  });

  it('[PATCH] /api/v1/users/me/settings/privacy → 200 updating multiple fields', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'update-privacy-multi@example.com',
      'upd_privacy_multi',
    );

    const response = await request(server)
      .patch('/api/v1/users/me/settings/privacy')
      .set('Cookie', cookies)
      .send({ showAchievements: false, showActivity: false });

    expect(response.status).toBe(200);
    expect(response.body.showAchievements).toBe(false);
    expect(response.body.showActivity).toBe(false);
    expect(response.body.publicProfile).toBe(true);
    expect(response.body.showTotalPaid).toBe(true);
  });

  it('[PATCH] /api/v1/users/me/settings/privacy → 200 sending empty body keeps existing values', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'update-privacy-empty@example.com',
      'upd_privacy_empty',
    );

    const response = await request(server)
      .patch('/api/v1/users/me/settings/privacy')
      .set('Cookie', cookies)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      publicProfile: true,
      showTotalPaid: true,
      showAchievements: true,
      showActivity: true,
    });
  });

  it('[PATCH] /api/v1/users/me/settings/privacy → 400 when field is not a boolean', async () => {
    const response = await request(server)
      .patch('/api/v1/users/me/settings/privacy')
      .set('Cookie', sharedCookies)
      .send({ publicProfile: 'yes' });

    expect(response.status).toBe(400);
  });

  it('[PATCH] /api/v1/users/me/settings/privacy → persists changes on subsequent GET', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'update-privacy-persist@example.com',
      'upd_privacy_persist',
    );

    await request(server)
      .patch('/api/v1/users/me/settings/privacy')
      .set('Cookie', cookies)
      .send({ publicProfile: false });

    const getResponse = await request(server)
      .get('/api/v1/users/me/settings/privacy')
      .set('Cookie', cookies);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.publicProfile).toBe(false);
  });
});
