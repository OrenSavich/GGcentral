export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (!configured) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }

  return configured.replace(/\/$/, '');
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: { accept: 'application/json' },
  });

  if (!response.ok) {
    throw new ApiError(`API request failed with status ${response.status}`, response.status);
  }

  return (await response.json()) as T;
}
