import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthService } from '../application/auth.service';
import { LoginDto } from './dtos/login.dto';
import { LoginCredentials } from '../domain/types/login-credentials.type';

/**
 * Controller responsible for handling authentication-related HTTP requests.
 *
 * This class acts as a driving adapter in the Hexagonal Architecture,
 * receiving external HTTP requests, validating incoming payloads via DTOs,
 * and delegating the business logic to the application layer (AuthService).
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  /**
   * Initializes the AuthController with the necessary application service.
   *
   * @param {AuthService} authService - The application service orchestrating the login use case.
   */
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const credentials: LoginCredentials = {
      email: loginDto.email,
      plainPassword: loginDto.password,
    };

    const { accessToken, refreshToken } =
      await this.authService.login(credentials);

    const isProduction = process.env.NODE_ENV === 'production';

    // Cookie del Access Token (5 minutos)
    response.cookie('sso_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      domain: '.local', // Permite compartir la cookie entre sso.local y skopos-admin.local
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000,
    });

    // Cookie del Refresh Token (6 horas)
    response.cookie('sso_refresh', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      domain: '.local',
      sameSite: 'lax',
      path: '/api/v1/auth/refresh', // Seguridad extra: Esta cookie solo se envía a este endpoint
      maxAge: 6 * 60 * 60 * 1000,
    });

    return {
      message: 'Autenticación exitosa',
    };
  }

  /**
   * Endpoint to log out the user.
   *
   * It clears the HttpOnly SSO cookie, effectively ending the session
   * across all satellite applications that depend on this provider.
   *
   * @param {Response} response - The Express response object used to clear the cookie.
   * @returns A simple success message.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log out user',
    description:
      'Clears the HttpOnly authentication cookie to terminate the active session.',
  })
  @ApiOkResponse({ description: 'Logout successful, cookie cleared.' })
  async logout(@Res({ passthrough: true }) response: Response) {
    response.cookie('sso_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
    });

    return { message: 'Sesión cerrada exitosamente' };
  }
}
