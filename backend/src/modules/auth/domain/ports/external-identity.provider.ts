import { LoginCredentials } from '../types/login-credentials.type';
import { AuthenticatedUser } from '../types/authenticated-user.type';

/**
 * Port defining the contract for external identity validation.
 *
 * Implementations of this interface are responsible for communicating
 * with external systems to verify user credentials.
 */
export interface IExternalIdentityProvider {
  /**
   * Validates user credentials against an external system.
   *
   * Implementations must throw an exception (e.g., UnauthorizedException)
   * if the credentials are invalid or if the validation process fails.
   *
   * @param {LoginCredentials} credentials - An immutable object containing the email and plain text password.
   * @returns {Promise<AuthenticatedUser>} A promise that resolves to the basic user data required to sign the token.
   */
  validateUser(credentials: LoginCredentials): Promise<AuthenticatedUser>;
}
