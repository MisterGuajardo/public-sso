import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './core/config/app.config';
import { envValidationSchema } from './core/config/app.joi';
import { AuthModule } from './modules/auth/auth.module';
import jwtConfig from './core/config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig],
      validationSchema: envValidationSchema,
    }),
    AuthModule,
  ],
})
export class AppModule {}
