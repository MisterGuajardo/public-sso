import { JwtPayload } from '../types/jwt-payload.type';

export interface ITokenProvider {
  signPayload(
    payload: JwtPayload,
  ): Promise<{ accessToken: string; refreshToken: string }>;
}
