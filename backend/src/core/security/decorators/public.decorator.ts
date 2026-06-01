import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator that marks a route as public, bypassing the global JWT Auth Guard.
 *
 * Use this on endpoints like login, register, or health checks where
 * an authentication token is not required.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
