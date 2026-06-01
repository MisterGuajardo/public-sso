import { Injectable, Inject, Logger } from '@nestjs/common';
import { IExternalIdentityProvider } from '../domain/ports/external-identity.provider';
import { ITokenProvider } from '../domain/ports/token.provider';
import { LoginCredentials } from '../domain/types/login-credentials.type';
import { JwtPayload } from '../domain/types/jwt-payload.type';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject('IExternalIdentityProvider')
    private readonly identityProvider: IExternalIdentityProvider,

    @Inject('ITokenProvider')
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async login(
    credentials: LoginCredentials,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    this.logger.log(`Iniciando intento de login para: ${credentials.email}`);

    const validUser = await this.identityProvider.validateUser(credentials);

    const payload: JwtPayload = {
      sub: validUser.email,
      role: validUser.role,
    };

    const tokens = await this.tokenProvider.signPayload(payload);

    this.logger.log(
      `Login exitoso para: ${credentials.email}. Tokens generados.`,
    );

    return tokens;
  }
}
