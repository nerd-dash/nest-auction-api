import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { HashModule } from '../hash';
import { UserModule } from '../user';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtConfigModule } from './config';
import { JwtAuthGuard, LocalAuthGuard } from './guard';
import { JwtStrategy, LocalStrategy, RefreshAuthStrategy } from './strategy';

@Module({
  imports: [PassportModule, UserModule, HashModule, JwtConfigModule],

  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtAuthGuard,
    LocalAuthGuard,
    RefreshAuthStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
