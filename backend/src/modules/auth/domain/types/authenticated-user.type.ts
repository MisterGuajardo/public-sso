/**
 * Represents the authenticated user data returned by the external identity provider.
 *
 * This type encapsulates the minimal necessary information required to identify
 * the user across the distributed ecosystem after successful validation.
 */
export type AuthenticatedUser = {
  /**
   * The universal identifier for the user across all satellite systems.
   */
  readonly email: string;

  /*
   * Future implementation:
   * Array defining which systems or applications the user is permitted to access.
   * readonly allowedSystems?: string[];
   */
  readonly role: string;
};
