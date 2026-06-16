export type HealthStatus = 'ok';

export interface HealthResponse {
  status: HealthStatus;
  service: string;
  version: string;
  environment: string;
  uptime: number;
  timestamp: string;
}

export interface ReadinessResponse extends HealthResponse {
  checks: {
    app: HealthStatus;
  };
}
