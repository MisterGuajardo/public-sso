import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser = require('cookie-parser');
import { XssSanitizerPipe } from './common/pipes/xss-sanitizer.pipe';
import { GlobalExceptionFilter } from './core/exceptions/global-exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  app.use(helmet());

  const corsOriginsString = configService.get<string>('app.corsOrigins') || '*';
  const corsOrigins = corsOriginsString.includes(',') 
    ? corsOriginsString.split(',') 
    : corsOriginsString;

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.use(cookieParser());
  app.useGlobalPipes(new XssSanitizerPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SSO Provider API')
    .setDescription('Single Sign-On Identity Provider for external systems')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = 3001;
  await app.listen(port);

  logger.log(`SSO Application is successfully running on port ${port}`);
  logger.log(
    `API Documentation available at: http://localhost:${port}/api/docs`,
  );
}

bootstrap();
