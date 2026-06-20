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

describe('GetPublicUserPayments (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let publicCookies: string[];
  let privateCookies: string[];

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;

    publicCookies = await signUpAndGetCookies(
      server,
      'pub-payments@example.com',
      'pub_payments',
    );

    privateCookies = await signUpAndGetCookies(
      server,
      'priv-payments@example.com',
      'priv_payments',
    );

    // Create some payments for the public user
    for (let i = 0; i < 3; i++) {
      await request(server)
        .post('/api/v1/payments')
        .set('Cookie', publicCookies)
        .send({ amountInCents: 100 });
    }

    // Disable activity for the private user
    await request(server)
      .patch('/api/v1/users/me/settings/privacy')
      .set('Cookie', privateCookies)
      .send({ showActivity: false });

    await request(server)
      .post('/api/v1/payments')
      .set('Cookie', privateCookies)
      .send({ amountInCents: 100 });
  });

  afterAll(async () => {
    await app.close();
  });

  it('[GET] /api/v1/users/:username/payments → 404 for unknown username', async () => {
    const response = await request(server).get(
      '/api/v1/users/nobody_here/payments',
    );

    expect(response.status).toBe(404);
  });

  it('[GET] /api/v1/users/:username/payments → 200 returns payments for public user', async () => {
    const response = await request(server).get(
      '/api/v1/users/pub_payments/payments',
    );

    expect(response.status).toBe(200);
    expect(response.body.payments).toHaveLength(3);
    expect(response.body.payments[0].amount).toBeDefined();
    expect(response.body.nextCursor).toBeNull();
  });

  it('[GET] /api/v1/users/:username/payments → 403 when showActivity is false', async () => {
    const response = await request(server).get(
      '/api/v1/users/priv_payments/payments',
    );

    expect(response.status).toBe(403);
  });

  it('[GET] /api/v1/users/:username/payments → caps at 8 items max', async () => {
    const manyCookies = await signUpAndGetCookies(
      server,
      'many-payments@example.com',
      'many_payments',
    );

    for (let i = 0; i < 10; i++) {
      await request(server)
        .post('/api/v1/payments')
        .set('Cookie', manyCookies)
        .send({ amountInCents: 100 });
    }

    const response = await request(server).get(
      '/api/v1/users/many_payments/payments',
    );

    expect(response.status).toBe(200);
    expect(response.body.payments).toHaveLength(8);
  });
});
