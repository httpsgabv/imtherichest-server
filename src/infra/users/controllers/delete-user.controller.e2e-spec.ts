import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import { createNestApp } from '../../../../test/create-nest-app.js';

describe('DeleteUser (E2E)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('[DELETE] /api/v1/users/me → 401 when unauthenticated', async () => {
    const response = await request(server).delete('/api/v1/users/me');

    expect(response.status).toBe(401);
  });
});
