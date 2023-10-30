import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HashModule } from '../hash';
import { UserModule } from '../user';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard, LocalAuthGuard } from './guard';
import { JwtStrategy, LocalStrategy, RefreshAuthStrategy } from './strategy';

@Module({
  imports: [
    PassportModule,
    UserModule,
    HashModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '5m' },
      }),
    }),
  ],

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
