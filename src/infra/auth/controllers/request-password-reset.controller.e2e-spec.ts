import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import { createNestApp } from '../../../../test/create-nest-app.js';

describe('RequestPasswordReset (E2E)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('[POST] /api/v1/auth/request-password-reset → 200 with success for a registered email', async () => {
    await request(server).post('/api/v1/auth/sign-up/email').send({
      username: 'reset_user',
      email: 'reset-registered@example.com',
      password: '12345678',
    });

    const response = await request(server)
      .post('/api/v1/auth/request-password-reset')
      .send({ email: 'reset-registered@example.com' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('[POST] /api/v1/auth/request-password-reset → 200 even for an unregistered email', async () => {
    const response = await request(server)
      .post('/api/v1/auth/request-password-reset')
      .send({ email: 'nonexistent@example.com' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('[POST] /api/v1/auth/request-password-reset → 200 with optional redirectTo', async () => {
    const response = await request(server)
      .post('/api/v1/auth/request-password-reset')
      .send({
        email: 'reset-redirect@example.com',
        redirectTo: 'https://app.example.com/reset-password',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('[POST] /api/v1/auth/request-password-reset → 400 when email is missing', async () => {
    const response = await request(server)
      .post('/api/v1/auth/request-password-reset')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.issues).toBeDefined();
  });

  it('[POST] /api/v1/auth/request-password-reset → 400 when email is invalid', async () => {
    const response = await request(server)
      .post('/api/v1/auth/request-password-reset')
      .send({ email: 'not-an-email' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'email' })]),
    );
  });

  it('[POST] /api/v1/auth/request-password-reset → 400 when redirectTo is not a valid URL', async () => {
    const response = await request(server)
      .post('/api/v1/auth/request-password-reset')
      .send({ email: 'user@example.com', redirectTo: 'not-a-url' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'redirectTo' })]),
    );
  });
});
