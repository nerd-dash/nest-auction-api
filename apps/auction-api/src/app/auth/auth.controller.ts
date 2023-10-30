import {
  Controller,
  Get,
  Post,
  Req,
  Request,
  Res,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import { Response } from 'express';
import { User } from '../user';
import { REFRESH_TOKEN_KEY } from './auth.constants';
import { AuthService } from './auth.service';
import { JwtAuthGuard, LocalAuthGuard, RefreshAuthGuard } from './guard';

type RequestWithUser = Request & { user: User };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response
  ) {
    const { access_token, refresh_token } = await this.authService.login(
      req.user
    );
    res
      .cookie(REFRESH_TOKEN_KEY, refresh_token, { httpOnly: true, signed: true })
      .send({ access_token });
  }

  @UseGuards(RefreshAuthGuard)
  @Get('refresh')
  async refresh(
    @Req() req: RequestWithUser,
  ) {
    if (req?.user) {
      const { access_token } = await this.authService.login(req.user);
      return { access_token };
    }

    throw new UnauthorizedException();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }
}
