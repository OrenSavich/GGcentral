import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { safeErrorDetail } from './redaction.js';

interface ErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
}

interface RequestWithUrl {
  url?: string;
}

interface ResponseWithJson {
  status(code: number): { json(body: ErrorBody): void };
}

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<ResponseWithJson>();
    const request = http.getRequest<RequestWithUrl>();
    const path = request.url ?? '';
    const body = toErrorBody(exception, path);

    if (body.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        {
          statusCode: body.statusCode,
          path,
          detail: safeErrorDetail(exception),
        },
        'Request failed',
      );
    }

    response.status(body.statusCode).json(body);
  }
}

function toErrorBody(exception: unknown, path: string): ErrorBody {
  const timestamp = new Date().toISOString();

  if (exception instanceof HttpException) {
    const raw = exception.getResponse();
    const message = readMessage(raw, exception.message);
    const error = readError(raw, exception.name);

    return {
      statusCode: exception.getStatus(),
      error,
      message,
      path,
      timestamp,
    };
  }

  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    error: 'Internal Server Error',
    message: 'Internal server error',
    path,
    timestamp,
  };
}

function readMessage(raw: string | object, fallback: string): string | string[] {
  if (typeof raw === 'string') {
    return raw;
  }

  if ('message' in raw && (typeof raw.message === 'string' || Array.isArray(raw.message))) {
    return raw.message;
  }

  return fallback;
}

function readError(raw: string | object, fallback: string): string {
  if (typeof raw === 'object' && 'error' in raw && typeof raw.error === 'string') {
    return raw.error;
  }

  return fallback;
}
