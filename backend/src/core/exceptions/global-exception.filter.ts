import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global Exception Filter to standardize all HTTP error responses.
 * Enforces data minimization by hiding internal paths and stack traces from the client.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Error interno del servidor';

    if (exception instanceof HttpException) {
      const responseBody = exception.getResponse();
      if (typeof responseBody === 'object' && 'message' in responseBody) {
        message = (responseBody as any).message;
      } else {
        message = exception.message;
      }
    }

    // El registro interno (Logs) mantiene el path y los detalles para depuración
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      const errorDetails =
        exception instanceof Error ? exception.stack : exception;
      this.logger.error(
        `[CRITICAL] ${request.method} ${request.url} - ${errorDetails}`,
      );

      message =
        'El servicio no está disponible en este momento. Por favor, intente más tarde.';
    } else {
      this.logger.warn(
        `[CLIENT ERROR] ${status} - ${request.method} ${request.url} - ${JSON.stringify(message)}`,
      );
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: message,
    });
  }
}
