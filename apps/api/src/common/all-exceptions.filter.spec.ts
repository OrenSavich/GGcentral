import { type ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import type { Logger } from 'nestjs-pino';
import { AllExceptionsFilter } from './all-exceptions.filter.js';

describe('AllExceptionsFilter', () => {
  const error = vi.fn();
  const logger = { error } as unknown as Logger;

  beforeEach(() => {
    error.mockReset();
  });

  it('returns the http exception message without logging it as a server failure', () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const filter = new AllExceptionsFilter(logger);

    filter.catch(new HttpException('Missing field', HttpStatus.BAD_REQUEST), host(status));

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Missing field',
        path: '/health',
      }),
    );
    expect(error).not.toHaveBeenCalled();
  });

  it('hides internal messages and connection strings from the client and the log', () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const filter = new AllExceptionsFilter(logger);
    const exception = new Error(
      'connect failed postgresql://ggcentral:ggcentral_local_only@localhost:5432/ggcentral',
    );

    filter.catch(exception, host(status));

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      }),
    );
    expect(JSON.stringify(json.mock.calls)).not.toContain('postgresql://');
    expect(error).toHaveBeenCalledWith(
      expect.objectContaining({ detail: 'Error' }),
      'Request failed',
    );
    expect(JSON.stringify(error.mock.calls)).not.toContain('postgresql://');
  });
});

function host(status: ReturnType<typeof vi.fn>): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ url: '/health' }),
    }),
  } as ArgumentsHost;
}
