import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { REFRESH_TOKEN_KEY } from '../auth.constants';
import { JwtPayloadDto } from '../dto';

export const REFRESH_STRATEGY_NAME = 'refresh';

@Injectable()
export class RefreshAuthStrategy extends PassportStrategy(
  Strategy,
  REFRESH_STRATEGY_NAME
) {
  constructor(readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return this.getRefreshTokenFromCookie(request);
        },
      ]),

      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate({ sub, user }: JwtPayloadDto) {
    return { sub, user };
  }

  private getRefreshTokenFromCookie(request: Request): string {
    return request?.signedCookies?.[REFRESH_TOKEN_KEY] || null;
  }
}
