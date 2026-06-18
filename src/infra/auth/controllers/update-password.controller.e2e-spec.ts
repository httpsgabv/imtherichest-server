import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import { createNestApp } from '../../../../test/create-nest-app.js';

describe('UpdatePassword (E2E)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  async function signUpAndGetCookies(
    email: string,
    username: string,
    password = '12345678',
  ): Promise<string[]> {
    const response = await request(server)
      .post('/api/v1/auth/sign-up/email')
      .send({ username, email, password });
    return response.headers['set-cookie'] as unknown as string[];
  }

  it('[POST] /api/v1/auth/update-password → 200 when current password is correct', async () => {
    const cookies = await signUpAndGetCookies(
      'update-pw-success@example.com',
      'updatepw_success',
    );

    const response = await request(server)
      .post('/api/v1/auth/update-password')
      .set('Cookie', cookies)
      .send({
        currentPassword: '12345678',
        newPassword: 'newpassword123',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('[POST] /api/v1/auth/update-password → 200 and can sign in with new password after update', async () => {
    const email = 'update-pw-relogin@example.com';
    const cookies = await signUpAndGetCookies(email, 'updatepw_relogin', '12345678');

    await request(server)
      .post('/api/v1/auth/update-password')
      .set('Cookie', cookies)
      .send({
        currentPassword: '12345678',
        newPassword: 'mynewpassword',
      });

    const signInResponse = await request(server)
      .post('/api/v1/auth/sign-in/email')
      .send({ email, password: 'mynewpassword' });

    expect(signInResponse.status).toBe(200);
  });

  it('[POST] /api/v1/auth/update-password → 401 when current password is wrong', async () => {
    const cookies = await signUpAndGetCookies(
      'update-pw-badpass@example.com',
      'updatepw_badpass',
    );

    const response = await request(server)
      .post('/api/v1/auth/update-password')
      .set('Cookie', cookies)
      .send({
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('INVALID_PASSWORD');
  });

  it('[POST] /api/v1/auth/update-password → 401 when not authenticated', async () => {
    const response = await request(server)
      .post('/api/v1/auth/update-password')
      .send({
        currentPassword: '12345678',
        newPassword: 'newpassword123',
      });

    expect(response.status).toBe(401);
  });

  it('[POST] /api/v1/auth/update-password → 400 when newPassword is too short', async () => {
    const cookies = await signUpAndGetCookies(
      'update-pw-short@example.com',
      'updatepw_short',
    );

    const response = await request(server)
      .post('/api/v1/auth/update-password')
      .set('Cookie', cookies)
      .send({
        currentPassword: '12345678',
        newPassword: '123',
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'newPassword' }),
      ]),
    );
  });

  it('[POST] /api/v1/auth/update-password → 400 when a required field is missing', async () => {
    const cookies = await signUpAndGetCookies(
      'update-pw-missing@example.com',
      'updatepw_missing',
    );

    const response = await request(server)
      .post('/api/v1/auth/update-password')
      .set('Cookie', cookies)
      .send({ currentPassword: '12345678' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.issues).toBeDefined();
  });
});
