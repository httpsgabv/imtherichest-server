import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import { createNestApp } from '../../../../test/create-nest-app.js';

describe('SignInWithEmail (E2E)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('[POST] /api/v1/auth/sign-in/email → 200 with user object and Set-Cookie header', async () => {
    await request(server).post('/api/v1/auth/sign-up/email').send({
      username: 'signin_success',
      email: 'signin-success@example.com',
      password: '12345678',
    });

    const response = await request(server)
      .post('/api/v1/auth/sign-in/email')
      .send({
        email: 'signin-success@example.com',
        password: '12345678',
      });

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      email: 'signin-success@example.com',
      emailVerified: false,
    });
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('[POST] /api/v1/auth/sign-in/email → 401 when password is wrong', async () => {
    await request(server).post('/api/v1/auth/sign-up/email').send({
      username: 'signin_badpass',
      email: 'signin-badpass@example.com',
      password: '12345678',
    });

    const response = await request(server)
      .post('/api/v1/auth/sign-in/email')
      .send({
        email: 'signin-badpass@example.com',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('[POST] /api/v1/auth/sign-in/email → 401 when email does not exist', async () => {
    const response = await request(server)
      .post('/api/v1/auth/sign-in/email')
      .send({
        email: 'nonexistent@example.com',
        password: '12345678',
      });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('[POST] /api/v1/auth/sign-in/email → 400 when a required field is missing', async () => {
    const response = await request(server)
      .post('/api/v1/auth/sign-in/email')
      .send({
        email: 'john@example.com',
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.issues).toBeDefined();
  });

  it('[POST] /api/v1/auth/sign-in/email → 400 when email is invalid', async () => {
    const response = await request(server)
      .post('/api/v1/auth/sign-in/email')
      .send({
        email: 'not-an-email',
        password: '12345678',
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'email' })]),
    );
  });
});
