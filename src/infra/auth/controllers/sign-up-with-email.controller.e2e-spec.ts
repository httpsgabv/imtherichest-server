import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import { PrismaService } from '#infra/database/prisma/prisma.service.js';
import { createNestApp } from '../../../../test/create-nest-app.js';

describe('SignUpWithEmail (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: Server;

  beforeAll(async () => {
    app = await createNestApp();
    prisma = app.get(PrismaService);
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('[POST] /api/v1/auth/sign-up/email → 201 with user object and Set-Cookie header', async () => {
    const response = await request(server)
      .post('/api/v1/auth/sign-up/email')
      .send({
        username: 'johndoe',
        email: 'john@example.com',
        password: '12345678',
      });

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({
      email: 'john@example.com',
      emailVerified: false,
    });
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('[POST] /api/v1/auth/sign-up/email → 201 user is persisted in the database', async () => {
    await request(server).post('/api/v1/auth/sign-up/email').send({
      username: 'janedoe',
      email: 'jane@example.com',
      password: '12345678',
    });

    const user = await prisma.user.findFirst({
      where: { email: 'jane@example.com' },
    });

    expect(user).not.toBeNull();
    expect(user).toMatchObject({
      email: 'jane@example.com',
    });
  });

  it('[POST] /api/v1/auth/sign-up/email → 409 when email is already in use', async () => {
    await request(server).post('/api/v1/auth/sign-up/email').send({
      username: 'dupuser1',
      email: 'duplicate@example.com',
      password: '12345678',
    });

    const response = await request(server)
      .post('/api/v1/auth/sign-up/email')
      .send({
        username: 'dupuser2',
        email: 'duplicate@example.com',
        password: '12345678',
      });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('EMAIL_ALREADY_IN_USE');
  });

  it('[POST] /api/v1/auth/sign-up/email → 400 when a required field is missing', async () => {
    const response = await request(server)
      .post('/api/v1/auth/sign-up/email')
      .send({
        username: 'johndoe2',
        email: 'john2@example.com',
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.issues).toBeDefined();
  });

  it('[POST] /api/v1/auth/sign-up/email → 400 with issue on password when it is too short', async () => {
    const response = await request(server)
      .post('/api/v1/auth/sign-up/email')
      .send({
        username: 'johndoe3',
        email: 'john3@example.com',
        password: '123',
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'password' })]),
    );
  });
});
