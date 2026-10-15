import { apiGet } from './client';

export interface HealthStatus {
  status: 'ok';
}

export function getLiveHealth(): Promise<HealthStatus> {
  return apiGet<HealthStatus>('/health');
}

export function getReadyHealth(): Promise<HealthStatus> {
  return apiGet<HealthStatus>('/health/ready');
}
