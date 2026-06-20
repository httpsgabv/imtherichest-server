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

describe('GetProfileByUsername (E2E)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('[GET] /api/v1/users/:username → 404 for unknown username', async () => {
    const response = await request(server).get('/api/v1/users/doesnotexist');
    expect(response.status).toBe(404);
  });

  it('[GET] /api/v1/users/:username → 200 with public profile for anonymous caller', async () => {
    await signUpAndGetCookies(
      server,
      'public-profile-anon@example.com',
      'public_anon',
    );

    const response = await request(server).get('/api/v1/users/public_anon');

    expect(response.status).toBe(200);
    expect(response.body.username).toBe('public_anon');
    expect(response.body.points).toBe(0);
    expect(response.body.rank).toBeGreaterThanOrEqual(1);
    expect(response.body.isOwner).toBe(false);
    expect(response.body.createdAt).toBeDefined();
  });

  it('[GET] /api/v1/users/:username → includes privacySettings in response', async () => {
    await signUpAndGetCookies(
      server,
      'public-profile-privacy@example.com',
      'pub_privacy_check',
    );

    const response = await request(server).get(
      '/api/v1/users/pub_privacy_check',
    );

    expect(response.status).toBe(200);
    expect(response.body.privacySettings).toMatchObject({
      publicProfile: true,
      showTotalPaid: true,
      showAchievements: true,
      showActivity: true,
    });
  });

  it('[GET] /api/v1/users/:username → 404 for private profile from anonymous caller', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'private-profile-anon@example.com',
      'private_anon',
    );

    await request(server)
      .patch('/api/v1/users/me/settings/privacy')
      .set('Cookie', cookies)
      .send({ publicProfile: false });

    const response = await request(server).get('/api/v1/users/private_anon');
    expect(response.status).toBe(404);
  });

  it('[GET] /api/v1/users/:username → 404 for private profile from a different authenticated user', async () => {
    const ownerCookies = await signUpAndGetCookies(
      server,
      'private-owner@example.com',
      'private_owner',
    );
    const otherCookies = await signUpAndGetCookies(
      server,
      'private-other@example.com',
      'private_other',
    );

    await request(server)
      .patch('/api/v1/users/me/settings/privacy')
      .set('Cookie', ownerCookies)
      .send({ publicProfile: false });

    const response = await request(server)
      .get('/api/v1/users/private_owner')
      .set('Cookie', otherCookies);

    expect(response.status).toBe(404);
  });

  it('[GET] /api/v1/users/:username → 200 with isOwner true when owner views their own private profile', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'private-self@example.com',
      'private_self',
    );

    await request(server)
      .patch('/api/v1/users/me/settings/privacy')
      .set('Cookie', cookies)
      .send({ publicProfile: false });

    const response = await request(server)
      .get('/api/v1/users/private_self')
      .set('Cookie', cookies);

    expect(response.status).toBe(200);
    expect(response.body.username).toBe('private_self');
    expect(response.body.isOwner).toBe(true);
  });

  it('[GET] /api/v1/users/:username → totalPaid is null when showTotalPaid is false and caller is not owner', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'hide-total-paid@example.com',
      'hide_total_paid',
    );

    await request(server)
      .patch('/api/v1/users/me/settings/privacy')
      .set('Cookie', cookies)
      .send({ showTotalPaid: false });

    const response = await request(server).get('/api/v1/users/hide_total_paid');

    expect(response.status).toBe(200);
    expect(response.body.totalPaid).toBeNull();
  });

  it('[GET] /api/v1/users/:username → totalPaid is visible to the owner even when showTotalPaid is false', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'owner-sees-total@example.com',
      'owner_sees_total',
    );

    await request(server)
      .patch('/api/v1/users/me/settings/privacy')
      .set('Cookie', cookies)
      .send({ showTotalPaid: false });

    const response = await request(server)
      .get('/api/v1/users/owner_sees_total')
      .set('Cookie', cookies);

    expect(response.status).toBe(200);
    expect(response.body.totalPaid).toBe(0);
    expect(response.body.isOwner).toBe(true);
  });
});
