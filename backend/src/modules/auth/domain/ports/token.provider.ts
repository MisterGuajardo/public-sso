import { JwtPayload } from '../types/jwt-payload.type';

/**
 * Port defining the contract for cryptographic token generation.
 *
 * Implementations of this interface are responsible for handling
 * the creation and secure signing of JSON Web Tokens (JWT).
 */
export interface ITokenProvider {
  /**
   * Takes an immutable payload and returns a cryptographically signed JWT.
   *
   * @param {JwtPayload} payload - An immutable object containing the authenticated user's data.
   * @returns {Promise<string>} A promise that resolves to the signed token in string format.
   */
  signPayload(payload: JwtPayload): Promise<string>;
}
