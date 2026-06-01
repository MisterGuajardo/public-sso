import {
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { ITokenProvider } from '../../domain/ports/token.provider';
import { JwtPayload } from '../../domain/types/jwt-payload.type';
import jwtConfig from '../../../../core/config/jwt.config';

@Injectable()
export class JwtRsaAdapter implements ITokenProvider {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly config: ConfigType<typeof jwtConfig>,
  ) {}

  async signPayload(
    payload: JwtPayload,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const plainPayload = { ...payload };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(plainPayload, {
          expiresIn: this.config.accessExpiration as any,
        }),
        this.jwtService.signAsync(plainPayload, {
          expiresIn: this.config.refreshExpiration as any,
        }),
      ]);

      return { accessToken, refreshToken };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al firmar las credenciales de identidad',
      );
    }
  }
}
