import { GetLivenessService } from './get-liveness.service.js';
import { FakeEnvService } from '#test/env/fake-env.service.js';

describe('GetLivenessService', () => {
  let fakeEnvService: FakeEnvService;
  let getLivenessService: GetLivenessService;

  beforeEach(() => {
    fakeEnvService = new FakeEnvService();
    getLivenessService = new GetLivenessService(fakeEnvService);
  });

  it('should return status as ok', () => {
    const result = getLivenessService.execute();
    expect(result.status).toBe('ok');
  });

  it('should return service name from env', () => {
    fakeEnvService.set('APP_NAME', 'my-service');
    const result = getLivenessService.execute();
    expect(result.service).toBe('my-service');
  });

  it('should return version from env', () => {
    fakeEnvService.set('APP_VERSION', '2.0.0');
    const result = getLivenessService.execute();
    expect(result.version).toBe('2.0.0');
  });

  it('should return environment from env', () => {
    fakeEnvService.set('NODE_ENV', 'production');
    const result = getLivenessService.execute();
    expect(result.environment).toBe('production');
  });

  it('should return numeric uptime', () => {
    const result = getLivenessService.execute();
    expect(typeof result.uptime).toBe('number');
    expect(result.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should return ISO timestamp', () => {
    const result = getLivenessService.execute();
    expect(result.timestamp).toBeDefined();
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  it('should return correct response structure', () => {
    const result = getLivenessService.execute();
    expect(result).toEqual({
      status: 'ok',
      service: 'test-app',
      version: '1.0.0',
      environment: 'test',
      uptime: expect.any(Number),
      timestamp: expect.any(String),
    });
  });
});
