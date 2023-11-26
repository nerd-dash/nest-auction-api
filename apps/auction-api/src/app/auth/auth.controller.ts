import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import { Response } from 'express';
import { User } from '../user';
import { REFRESH_TOKEN_KEY } from './auth.constants';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto';
import { LocalAuthGuard, RefreshAuthGuard } from './guard';

export type RequestWithUser = Request & { user: User };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() signUpDto: SignUpDto) {
    return this.authService.register(signUpDto).catch(() => {
      throw new BadRequestException();
    });
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: RequestWithUser, @Res() res: Response) {
    const { access_token, refresh_token } = await this.authService.login(
      req.user
    );
    return res
      .cookie(REFRESH_TOKEN_KEY, refresh_token, {
        httpOnly: true,
        signed: true,
      })
      .status(200)
      .send({ access_token });
  }

  @UseGuards(RefreshAuthGuard)
  @Get('refresh')
  async refresh(@Req() req: RequestWithUser) {
    if (req?.user) {
      const { access_token } = await this.authService.login(req.user);
      return { access_token };
    }

    throw new UnauthorizedException();
  }
}
