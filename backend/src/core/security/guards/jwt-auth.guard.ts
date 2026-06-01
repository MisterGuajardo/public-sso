import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Global authentication guard enforcing JWT validation.
 *
 * This guard leverages Passport's JWT strategy to protect routes.
 * It also checks for the @Public() decorator to allow unauthenticated access
 * to specific endpoints.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Determines if the current request is allowed to proceed.
   *
   * @param {ExecutionContext} context - The execution context of the current request.
   * @returns {boolean | Promise<boolean> | Observable<boolean>} True if access is allowed.
   */
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If the route is marked as public, bypass the JWT check
    if (isPublic) {
      return true;
    }

    // Otherwise, execute the standard Passport JWT validation
    return super.canActivate(context);
  }

  /**
   * Handles the result of the Passport authentication process.
   *
   * @param {any} err - Potential error thrown by Passport.
   * @param {any} user - The user object returned by the strategy (if valid).
   * @returns {any} The validated user object.
   * @throws {UnauthorizedException} If authentication fails or the token is missing/invalid.
   */
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          'Token de acceso ausente, inválido o expirado.',
        )
      );
    }
    return user;
  }
}
