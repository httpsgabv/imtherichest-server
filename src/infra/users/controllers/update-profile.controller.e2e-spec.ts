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

describe('UpdateProfile (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let sharedCookies: string[];
  let separateCookies: string[];

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;

    sharedCookies = await signUpAndGetCookies(
      server,
      'update-shared@example.com',
      'update_shared',
    );
    separateCookies = await signUpAndGetCookies(
      server,
      'update-separate@example.com',
      'update_separate',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('[PATCH] /api/v1/users/me/profile → 401 when unauthenticated', async () => {
    const response = await request(server)
      .patch('/api/v1/users/me/profile')
      .send({ displayName: 'New Name' });

    expect(response.status).toBe(401);
  });

  it('[PATCH] /api/v1/users/me/profile → 200 with updated displayName', async () => {
    const response = await request(server)
      .patch('/api/v1/users/me/profile')
      .set('Cookie', sharedCookies)
      .send({ displayName: 'Updated Display Name' });

    expect(response.status).toBe(200);
    expect(response.body.displayName).toBe('Updated Display Name');
  });

  it('[PATCH] /api/v1/users/me/profile → 200 with updated bio', async () => {
    const response = await request(server)
      .patch('/api/v1/users/me/profile')
      .set('Cookie', sharedCookies)
      .send({ bio: 'This is my bio.' });

    expect(response.status).toBe(200);
    expect(response.body.bio).toBe('This is my bio.');
  });

  it('[PATCH] /api/v1/users/me/profile → 200 with updated country', async () => {
    const response = await request(server)
      .patch('/api/v1/users/me/profile')
      .set('Cookie', sharedCookies)
      .send({ country: 'DE' });

    expect(response.status).toBe(200);
    expect(response.body.country).toBe('DE');
  });

  it('[PATCH] /api/v1/users/me/profile → 200 updating multiple fields at once', async () => {
    const response = await request(server)
      .patch('/api/v1/users/me/profile')
      .set('Cookie', sharedCookies)
      .send({
        displayName: 'Multi Updated',
        bio: 'Multi bio',
        country: 'BR',
      });

    expect(response.status).toBe(200);
    expect(response.body.displayName).toBe('Multi Updated');
    expect(response.body.bio).toBe('Multi bio');
    expect(response.body.country).toBe('BR');
  });

  it('[PATCH] /api/v1/users/me/profile → 200 with updatedAt set after update', async () => {
    const before = new Date();

    const response = await request(server)
      .patch('/api/v1/users/me/profile')
      .set('Cookie', sharedCookies)
      .send({ bio: 'timestamp test' });

    expect(response.status).toBe(200);
    expect(response.body.updatedAt).not.toBeNull();
    expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
  });

  it('[PATCH] /api/v1/users/me/profile → 200 sending empty body changes no fields', async () => {
    const meResponse = await request(server)
      .get('/api/v1/users/me')
      .set('Cookie', sharedCookies);

    const response = await request(server)
      .patch('/api/v1/users/me/profile')
      .set('Cookie', sharedCookies)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.displayName).toBe(meResponse.body.displayName);
    expect(response.body.bio).toBe(meResponse.body.bio);
    expect(response.body.country).toBe(meResponse.body.country);
  });

  it('[PATCH] /api/v1/users/me/profile → 400 when bio exceeds 280 chars', async () => {
    const response = await request(server)
      .patch('/api/v1/users/me/profile')
      .set('Cookie', sharedCookies)
      .send({ bio: 'x'.repeat(281) });

    expect(response.status).toBe(400);
  });

  it('[PATCH] /api/v1/users/me/profile → 400 when country is not 2 letters', async () => {
    const response = await request(server)
      .patch('/api/v1/users/me/profile')
      .set('Cookie', sharedCookies)
      .send({ country: 'USA' });

    expect(response.status).toBe(400);
  });

  it('[PATCH] /api/v1/users/me/profile → 400 when avatarUrl is not a valid URL', async () => {
    const response = await request(server)
      .patch('/api/v1/users/me/profile')
      .set('Cookie', sharedCookies)
      .send({ avatarUrl: 'not-a-url' });

    expect(response.status).toBe(400);
  });

  it('[PATCH] /api/v1/users/me/profile → does not change username', async () => {
    const response = await request(server)
      .patch('/api/v1/users/me/profile')
      .set('Cookie', separateCookies)
      .send({ displayName: 'Still me' });

    expect(response.status).toBe(200);
    expect(response.body.username).toBe('update_separate');
  });
});
