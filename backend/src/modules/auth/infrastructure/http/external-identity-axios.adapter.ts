import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { IExternalIdentityProvider } from '../../domain/ports/external-identity.provider';
import { LoginCredentials } from '../../domain/types/login-credentials.type';
import { AuthenticatedUser } from '../../domain/types/authenticated-user.type';

/**
 * Infrastructure adapter responsible for external identity validation via HTTP.
 *
 * This class implements the IExternalIdentityProvider port, acting as a driven adapter
 * in the Hexagonal Architecture. It encapsulates the complexities of network communication,
 * configuration retrieval, and error mapping when contacting the external user management system.
 */
@Injectable()
export class ExternalIdentityAxiosAdapter implements IExternalIdentityProvider {
  private readonly logger = new Logger(ExternalIdentityAxiosAdapter.name);
  private readonly externalAuthUrl: string;

  /**
   * Initializes the adapter and retrieves required configurations.
   *
   * @param {HttpService} httpService - The NestJS Axios wrapper for making HTTP requests.
   * @param {ConfigService} configService - The NestJS service for accessing environment variables.
   */
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.externalAuthUrl =
      this.configService.get<string>('EXTERNAL_USER_SYSTEM_URL') || '';
  }

  /**
   * Validates user credentials by querying the external identity system.
   *
   * This method translates network responses and errors into domain-specific exceptions,
   * ensuring that the core application remains isolated from network-level failure details.
   *
   * @param {LoginCredentials} credentials - The immutable object containing the user's email and password.
   * @returns {Promise<AuthenticatedUser>} A promise that resolves to the authenticated user's basic data.
   * @throws {InternalServerErrorException} If the external URL is not configured or if a network/server error occurs.
   * @throws {UnauthorizedException} If the external system responds with a 401 (Unauthorized) or 404 (Not Found) status.
   */
  async validateUser(
    credentials: LoginCredentials,
  ): Promise<AuthenticatedUser> {
    if (!this.externalAuthUrl) {
      this.logger.error(
        'La variable de entorno EXTERNAL_USER_SYSTEM_URL no está configurada.',
      );
      throw new InternalServerErrorException(
        'Error de configuración en el SSO.',
      );
    }

    try {
      const response = await lastValueFrom(
        this.httpService.post(this.externalAuthUrl, {
          email: credentials.email,
          password: credentials.plainPassword,
        }),
      );

      const authenticatedUser: AuthenticatedUser = {
        email: response.data.email,
      };

      return authenticatedUser;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 404) {
        throw new UnauthorizedException('Credenciales inválidas.');
      }

      this.logger.error(
        `Error al contactar al sistema externo de usuarios: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'El servicio de validación de identidad no está disponible en este momento.',
      );
    }
  }
}
