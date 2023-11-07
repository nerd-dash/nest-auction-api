import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { User, UserService } from '../user';
import { REFRESH_TOKEN_KEY } from './auth.constants';
import { AuthService } from './auth.service';
import { JwtAuthGuard, LocalAuthGuard, RefreshAuthGuard } from './guard';
import { SignUpDto } from './dto';

export type RequestWithUser = Request & { user: User };

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @Post('register')
  register(@Body() signUpDto: SignUpDto) {
    try {
      return this.authService.register(signUpDto);
    }
    catch (e) {
      throw new BadRequestException();
    }
  }

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
      .cookie(REFRESH_TOKEN_KEY, refresh_token, {
        httpOnly: true,
        signed: true,
      })
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

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }
}
