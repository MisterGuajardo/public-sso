import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';
import { Request } from 'express';
import jwtConfig from '../../config/jwt.config';
import { JwtPayload } from '../../../modules/auth/domain/types/jwt-payload.type';

/**
 * Passport strategy for validating JSON Web Tokens (JWT).
 *
 * This strategy extracts the token from the HTTP-Only cookie (or fallback to Bearer),
 * and verifies its cryptographic signature using the RSA Public Key.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Initializes the JWT strategy with the necessary configuration.
   *
   * @param {ConfigType<typeof jwtConfig>} config - The typed JWT configuration containing the public key.
   */
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly config: ConfigType<typeof jwtConfig>,
  ) {
    super({
      // 1. Custom extractor: Primarily look for the 'sso_token' cookie
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.sso_token || null;
        },
        // Fallback: Also accept standard Authorization Bearer headers (useful for server-to-server calls)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      // 2. We use the PUBLIC KEY to verify the signature created by the PRIVATE KEY
      // TypeScript infers string | undefined. We assert 'string' because Joi guarantees it.
      secretOrKey: config.publicKey as string,
      algorithms: ['RS256'],
    });
  }

  /**
   * Validates the decoded payload after the signature has been successfully verified.
   * Passport automatically attaches the return value of this method to the Request object (req.user).
   *
   * @param {JwtPayload} payload - The decoded token payload.
   * @returns {any} The user context to be injected into the request.
   */
  async validate(payload: JwtPayload) {
    // We return the email mapped from the 'sub' claim.
    // This will be available as req.user in the controllers.
    return { email: payload.sub };
  }
}