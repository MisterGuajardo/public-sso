/**
 * Represents the data payload enclosed within the JSON Web Token.
 */
export type JwtPayload = {
  /**
   * Subject: Universal identifier for the user across the entire ecosystem.
   * Due to the distributed nature of the systems, the email address is used as the 'sub'.
   */
  readonly sub: string;

  /*
   * Note: By using the email as 'sub', it is no longer necessary to repeat
   * 'readonly email: string' unless required for convenience in the frontend.
   * Strictly speaking, the 'sub' claim already fulfills that function.
   *
   * readonly allowedSystems?: string[];
   */
};
