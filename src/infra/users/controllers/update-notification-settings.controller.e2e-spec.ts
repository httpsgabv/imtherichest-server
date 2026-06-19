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

describe('UpdateNotificationSettings (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let sharedCookies: string[];

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;

    sharedCookies = await signUpAndGetCookies(
      server,
      'update-notif-shared@example.com',
      'upd_notif_shared',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('[PATCH] /api/v1/users/me/settings/notifications → 401 when unauthenticated', async () => {
    const response = await request(server)
      .patch('/api/v1/users/me/settings/notifications')
      .send({ achievementAlerts: false });

    expect(response.status).toBe(401);
  });

  it('[PATCH] /api/v1/users/me/settings/notifications → 200 with updated achievementAlerts', async () => {
    const response = await request(server)
      .patch('/api/v1/users/me/settings/notifications')
      .set('Cookie', sharedCookies)
      .send({ achievementAlerts: false });

    expect(response.status).toBe(200);
    expect(response.body.achievementAlerts).toBe(false);
  });

  it('[PATCH] /api/v1/users/me/settings/notifications → 200 with updated rankAlerts', async () => {
    const response = await request(server)
      .patch('/api/v1/users/me/settings/notifications')
      .set('Cookie', sharedCookies)
      .send({ rankAlerts: false });

    expect(response.status).toBe(200);
    expect(response.body.rankAlerts).toBe(false);
  });

  it('[PATCH] /api/v1/users/me/settings/notifications → 200 with updated marketingEmails to true', async () => {
    const response = await request(server)
      .patch('/api/v1/users/me/settings/notifications')
      .set('Cookie', sharedCookies)
      .send({ marketingEmails: true });

    expect(response.status).toBe(200);
    expect(response.body.marketingEmails).toBe(true);
  });

  it('[PATCH] /api/v1/users/me/settings/notifications → 200 updating multiple fields', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'update-notif-multi@example.com',
      'upd_notif_multi',
    );

    const response = await request(server)
      .patch('/api/v1/users/me/settings/notifications')
      .set('Cookie', cookies)
      .send({ achievementAlerts: false, marketingEmails: true });

    expect(response.status).toBe(200);
    expect(response.body.achievementAlerts).toBe(false);
    expect(response.body.rankAlerts).toBe(true);
    expect(response.body.paymentConfirmations).toBe(true);
    expect(response.body.marketingEmails).toBe(true);
  });

  it('[PATCH] /api/v1/users/me/settings/notifications → 200 sending empty body keeps existing values', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'update-notif-empty@example.com',
      'upd_notif_empty',
    );

    const response = await request(server)
      .patch('/api/v1/users/me/settings/notifications')
      .set('Cookie', cookies)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      achievementAlerts: true,
      rankAlerts: true,
      paymentConfirmations: true,
      marketingEmails: false,
    });
  });

  it('[PATCH] /api/v1/users/me/settings/notifications → 400 when field is not a boolean', async () => {
    const response = await request(server)
      .patch('/api/v1/users/me/settings/notifications')
      .set('Cookie', sharedCookies)
      .send({ achievementAlerts: 'yes' });

    expect(response.status).toBe(400);
  });

  it('[PATCH] /api/v1/users/me/settings/notifications → persists changes on subsequent GET', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'update-notif-persist@example.com',
      'upd_notif_persist',
    );

    await request(server)
      .patch('/api/v1/users/me/settings/notifications')
      .set('Cookie', cookies)
      .send({ marketingEmails: true });

    const getResponse = await request(server)
      .get('/api/v1/users/me/settings/notifications')
      .set('Cookie', cookies);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.marketingEmails).toBe(true);
  });
});
