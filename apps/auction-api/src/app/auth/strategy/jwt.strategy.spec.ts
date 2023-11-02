import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JWT_STRATEGY_NAME, JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('secret'),
          },
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('should have correct strategy name', () => {
    expect(jwtStrategy.name).toEqual(JWT_STRATEGY_NAME);
  });

  it('should validate and return the user', async () => {
    const user = {
      sub: '123',
      user: { userName: 'testUser', password: 'password' },
    };
    expect(await jwtStrategy.validate(user)).toEqual(user);
  });
});
