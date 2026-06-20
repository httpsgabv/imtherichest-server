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

describe('CreatePayment (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let cookies: string[];

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;
    cookies = await signUpAndGetCookies(
      server,
      'payment-create@example.com',
      'payment_create',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('[POST] /api/v1/payments → 401 when unauthenticated', async () => {
    const response = await request(server)
      .post('/api/v1/payments')
      .send({ amountInCents: 500 });

    expect(response.status).toBe(401);
  });

  it('[POST] /api/v1/payments → 400 when amountInCents is missing', async () => {
    const response = await request(server)
      .post('/api/v1/payments')
      .set('Cookie', cookies)
      .send({});

    expect(response.status).toBe(400);
  });

  it('[POST] /api/v1/payments → 400 when amountInCents < 100', async () => {
    const response = await request(server)
      .post('/api/v1/payments')
      .set('Cookie', cookies)
      .send({ amountInCents: 99 });

    expect(response.status).toBe(400);
  });

  it('[POST] /api/v1/payments → 400 when amountInCents is 0', async () => {
    const response = await request(server)
      .post('/api/v1/payments')
      .set('Cookie', cookies)
      .send({ amountInCents: 0 });

    expect(response.status).toBe(400);
  });

  it('[POST] /api/v1/payments → 400 when amountInCents is a float', async () => {
    const response = await request(server)
      .post('/api/v1/payments')
      .set('Cookie', cookies)
      .send({ amountInCents: 150.5 });

    expect(response.status).toBe(400);
  });

  it('[POST] /api/v1/payments → 201 with valid payment', async () => {
    const response = await request(server)
      .post('/api/v1/payments')
      .set('Cookie', cookies)
      .send({ amountInCents: 500 });

    expect(response.status).toBe(201);
    expect(response.body.payment.amount).toBe(500);
    expect(response.body.payment.points).toBe(5);
    expect(response.body.payment.id).toBeDefined();
    expect(response.body.payment.createdAt).toBeDefined();
    expect(response.body.profile.points).toBeDefined();
    expect(response.body.profile.totalPaid).toBeDefined();
    expect(response.body.profile.rank).toBeDefined();
    expect(response.body.unlockedAchievements).toEqual([]);
  });

  it('[POST] /api/v1/payments → points and totalPaid accumulate across payments', async () => {
    const payCookies = await signUpAndGetCookies(
      server,
      'payment-accum@example.com',
      'payment_accum',
    );

    await request(server)
      .post('/api/v1/payments')
      .set('Cookie', payCookies)
      .send({ amountInCents: 1000 });

    const second = await request(server)
      .post('/api/v1/payments')
      .set('Cookie', payCookies)
      .send({ amountInCents: 2000 });

    expect(second.status).toBe(201);
    expect(second.body.profile.points).toBe(30);
    expect(second.body.profile.totalPaid).toBe(3000);
  });
});
