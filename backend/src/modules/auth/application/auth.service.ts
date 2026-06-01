import { Injectable, Inject, Logger } from '@nestjs/common';
import { IExternalIdentityProvider } from '../domain/ports/external-identity.provider';
import { ITokenProvider } from '../domain/ports/token.provider';
import { LoginCredentials } from '../domain/types/login-credentials.type';
import { JwtPayload } from '../domain/types/jwt-payload.type';

/**
 * Application service responsible for orchestrating the authentication workflow.
 *
 * This service acts as the primary use case in the Hexagonal Architecture,
 * coordinating the validation of credentials through an external provider
 * and the generation of a cryptographically signed token.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  /**
   * Initializes the AuthService with required domain ports.
   *
   * @param {IExternalIdentityProvider} identityProvider - Port to interact with the external user validation system.
   * @param {ITokenProvider} tokenProvider - Port responsible for cryptographic token generation.
   */
  constructor(
    @Inject('IExternalIdentityProvider')
    private readonly identityProvider: IExternalIdentityProvider,

    @Inject('ITokenProvider')
    private readonly tokenProvider: ITokenProvider,
  ) {}

  /**
   * Authenticates a user by validating credentials and issuing a signed JWT.
   *
   * The workflow consists of:
   * 1. Validating the user's identity against an external system.
   * 2. Constructing a JWT payload using the user's email as the universal identifier (sub).
   * 3. Signing the payload to generate the access token.
   *
   * @param {LoginCredentials} credentials - The immutable object containing the user's email and plain text password.
   * @returns {Promise<{ accessToken: string }>} A promise that resolves to an object containing the signed JWT access token.
   * @throws {UnauthorizedException} If the external identity validation fails (thrown by the adapter).
   * @throws {InternalServerErrorException} If token signing or external communication fails (thrown by the adapters).
   */
  async login(credentials: LoginCredentials): Promise<{ accessToken: string }> {
    this.logger.log(`Iniciando intento de login para: ${credentials.email}`);

    const validUser = await this.identityProvider.validateUser(credentials);

    const payload: JwtPayload = {
      sub: validUser.email,
    };

    const token = await this.tokenProvider.signPayload(payload);

    this.logger.log(
      `Login exitoso para: ${credentials.email}. Token generado.`,
    );

    return { accessToken: token };
  }
}
