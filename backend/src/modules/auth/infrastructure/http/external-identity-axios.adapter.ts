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

@Injectable()
export class ExternalIdentityAxiosAdapter implements IExternalIdentityProvider {
  private readonly logger = new Logger(ExternalIdentityAxiosAdapter.name);
  private readonly externalAuthUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.externalAuthUrl =
      this.configService.get<string>('EXTERNAL_USER_SYSTEM_URL') || '';
  }

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

      const userDataFromGo = response.data.user;

      const authenticatedUser: AuthenticatedUser = {
        email: credentials.email,
        role: userDataFromGo.role,
      };

      return authenticatedUser;
    } catch (error: any) {
      if (
        error.response?.status === 401 ||
        error.response?.status === 400 ||
        error.response?.status === 404
      ) {
        throw new UnauthorizedException('Credenciales inválidas.');
      }

      this.logger.error(
        `Error al contactar al sistema externo (Skopos-Admin): ${error.message}`,
      );
      throw new InternalServerErrorException(
        'El servicio de validación de identidad no está disponible en este momento.',
      );
    }
  }
}
