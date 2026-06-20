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

describe('GetUserPayments (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let cookies: string[];

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;
    cookies = await signUpAndGetCookies(
      server,
      'get-payments@example.com',
      'get_payments',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('[GET] /api/v1/users/me/payments → 401 when unauthenticated', async () => {
    const response = await request(server).get('/api/v1/users/me/payments');

    expect(response.status).toBe(401);
  });

  it('[GET] /api/v1/users/me/payments → 200 with empty list for new user', async () => {
    const response = await request(server)
      .get('/api/v1/users/me/payments')
      .set('Cookie', cookies);

    expect(response.status).toBe(200);
    expect(response.body.payments).toEqual([]);
    expect(response.body.nextCursor).toBeNull();
  });

  it('[GET] /api/v1/users/me/payments → 200 with payments after creating some', async () => {
    const payCookies = await signUpAndGetCookies(
      server,
      'get-payments-has@example.com',
      'get_payments_has',
    );

    await request(server)
      .post('/api/v1/payments')
      .set('Cookie', payCookies)
      .send({ amountInCents: 500 });

    await request(server)
      .post('/api/v1/payments')
      .set('Cookie', payCookies)
      .send({ amountInCents: 1000 });

    const response = await request(server)
      .get('/api/v1/users/me/payments')
      .set('Cookie', payCookies);

    expect(response.status).toBe(200);
    expect(response.body.payments).toHaveLength(2);
    expect(response.body.payments[0].amount).toBe(1000);
    expect(response.body.payments[1].amount).toBe(500);
  });

  it('[GET] /api/v1/users/me/payments → 200 with pagination cursor', async () => {
    const payCookies = await signUpAndGetCookies(
      server,
      'get-payments-page@example.com',
      'get_payments_page',
    );

    for (let i = 0; i < 5; i++) {
      await request(server)
        .post('/api/v1/payments')
        .set('Cookie', payCookies)
        .send({ amountInCents: 100 });
    }

    const firstPage = await request(server)
      .get('/api/v1/users/me/payments?limit=3')
      .set('Cookie', payCookies);

    expect(firstPage.status).toBe(200);
    expect(firstPage.body.payments).toHaveLength(3);
    expect(firstPage.body.nextCursor).not.toBeNull();

    const secondPage = await request(server)
      .get(
        `/api/v1/users/me/payments?limit=3&cursor=${firstPage.body.nextCursor}`,
      )
      .set('Cookie', payCookies);

    expect(secondPage.status).toBe(200);
    expect(secondPage.body.payments).toHaveLength(2);
    expect(secondPage.body.nextCursor).toBeNull();
  });
});
