import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../../core/config/jwt.config';
import { AuthService } from './application/auth.service';
import { ExternalIdentityAxiosAdapter } from './infrastructure/http/external-identity-axios.adapter';
import { JwtRsaAdapter } from './infrastructure/crypto/jwt-rsa.adapter';

@Module({
  imports: [
    HttpModule,
    JwtModule.registerAsync({
      inject: [jwtConfig.KEY],
      useFactory: async (config: ConfigType<typeof jwtConfig>) => ({
        signOptions: {
          algorithm: 'RS256',
          expiresIn: config.accessExpiration as any,
        },
        privateKey: config.privateKey,
        publicKey: config.publicKey,
      }),
    }),
  ],
  providers: [
    AuthService,
    {
      provide: 'IExternalIdentityProvider',
      useClass: ExternalIdentityAxiosAdapter,
    },
    {
      provide: 'ITokenProvider',
      useClass: JwtRsaAdapter,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
