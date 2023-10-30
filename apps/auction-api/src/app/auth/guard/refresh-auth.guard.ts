import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { REFRESH_STRATEGY_NAME } from '../strategy';

@Injectable()
export class RefreshAuthGuard extends AuthGuard(REFRESH_STRATEGY_NAME) {}
