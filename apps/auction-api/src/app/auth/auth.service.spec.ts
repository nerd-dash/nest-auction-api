import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { HashService } from '../hash/hash.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let hashService: HashService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id: '1', password: 'hashedPassword' }),
          },
        },
        {
          provide: HashService,
          useValue: {
            compare: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('testToken'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    hashService = module.get<HashService>(HashService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should validate and return the user', async () => {
    const user = await authService.validate({ username: 'test', password: 'test' });
    expect(userService.findOne).toHaveBeenCalledWith({ userName: 'test' });
    expect(hashService.compare).toHaveBeenCalledWith('test', 'hashedPassword');
    expect(user).toEqual({ id: '1' });
  });

  it('should return null if validation fails', async () => {
    jest.spyOn(hashService, 'compare').mockResolvedValueOnce(false);
    const user = await authService.validate({ username: 'test', password: 'wrong' });
    expect(user).toBeNull();
  });

  it('should generate access and refresh tokens', async () => {
    const tokens = await authService.login({ id: '1' });
    expect(jwtService.sign).toHaveBeenCalledTimes(2);
    expect(tokens).toEqual({ access_token: 'testToken', refresh_token: 'testToken' });
  });
});
