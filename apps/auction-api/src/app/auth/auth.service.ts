import { Injectable } from '@nestjs/common';
import { HashService } from '../hash';
import { User, UserService } from '../user';
import { JwtService } from '@nestjs/jwt';
import { SignInDto, SignUpDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService
  ) {}

  async validate({ username, password }: SignInDto) {
    const user = await this.userService.findOne({ userName: username });

    if (user && (await this.hashService.compare(password, user.password))) {
      delete user.password;
      return user;
    }

    return null;
  }

  async login(user: Partial<User>) {
    const payload = { sub: user.id, user };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async register({ username, password }: SignUpDto) {
    const user = await this.userService.create({
      userName: username,
      password,
    });
    delete user.password;
    return user;
  }
}
