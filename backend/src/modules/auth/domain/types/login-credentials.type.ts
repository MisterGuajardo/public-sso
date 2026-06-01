/**
 * Represents the credentials provided by the user during the authentication process.
 *
 * This type is strictly immutable to ensure that sensitive data is not altered
 * during its transit through the application layers to the external identity provider.
 */
export type LoginCredentials = {
  /**
   * The user's email address, serving as the primary identification factor.
   */
  readonly email: string;

  /**
   * The unencrypted password provided by the user.
   * This value is securely transmitted to the external identity provider for verification.
   */
  readonly plainPassword: string;
};
