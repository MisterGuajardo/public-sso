import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenProvider } from '../../domain/ports/token.provider';
import { JwtPayload } from '../../domain/types/jwt-payload.type';

/**
 * Infrastructure adapter responsible for generating cryptographic tokens.
 *
 * This class implements the ITokenProvider port using the NestJS JwtService.
 * It encapsulates the specific details of JWT generation (like RSA signing)
 * ensuring the core domain remains decoupled from the specific cryptography library.
 */
@Injectable()
export class JwtRsaAdapter implements ITokenProvider {
  /**
   * Initializes the adapter with the necessary external service.
   *
   * @param {JwtService} jwtService - The NestJS service configured at the module level
   *                                  to handle JWT operations (e.g., using RSA keys).
   */
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Asynchronously signs the provided payload to generate a JSON Web Token.
   *
   * Any internal cryptographic errors are caught and re-thrown as a standard
   * InternalServerErrorException to prevent leaking sensitive infrastructure
   * details or stack traces to the client.
   *
   * @param {JwtPayload} payload - The immutable data object to be embedded within the token.
   * @returns {Promise<string>} A promise that resolves to the generated JWT string.
   * @throws {InternalServerErrorException} If the token signing process fails.
   */
  async signPayload(payload: JwtPayload): Promise<string> {
    try {
      const token = await this.jwtService.signAsync(payload);
      return token;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al firmar las credenciales de identidad',
      );
    }
  }
}
