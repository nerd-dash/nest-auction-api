import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { LocalStrategy } from './local-auth.strategy';

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: {
            validate: jest.fn().mockResolvedValue({ id: '6a399af6-6dd2-4c4a-94de-6d05dd3d4e29' }),
          },
        },
      ],
    }).compile();

    localStrategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  it('should validate and return the user', async () => {
    const user = await localStrategy.validate('your_username', 'your_password');
    expect(authService.validate).toHaveBeenCalledWith({
      username: 'your_username',
      password: 'your_password',
    });
    expect(user).toEqual({ id: '6a399af6-6dd2-4c4a-94de-6d05dd3d4e29' });
  });

  it('should throw UnauthorizedException if validation fails', async () => {
    jest.spyOn(authService, 'validate').mockResolvedValueOnce(null);
    await expect(localStrategy.validate('test', 'wrong')).rejects.toThrow(
      UnauthorizedException
    );
  });
});
