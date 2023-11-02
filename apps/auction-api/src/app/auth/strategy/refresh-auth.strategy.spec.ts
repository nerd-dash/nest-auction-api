import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { REFRESH_TOKEN_KEY } from '../auth.constants';
import { JwtPayloadDto } from '../dto';
import { RefreshAuthStrategy } from './refresh-auth.strategy';

describe('RefreshAuthStrategy', () => {
  let refreshAuthStrategy: RefreshAuthStrategy;
  const user = { userName: 'test', password: 'test' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshAuthStrategy,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('testValue'),
          },
        },
      ],
    }).compile();

    refreshAuthStrategy = module.get<RefreshAuthStrategy>(RefreshAuthStrategy);
    refreshAuthStrategy.authenticate = jest
      .fn()
      .mockImplementation((req: Request) => {
        const token = (refreshAuthStrategy as any)._jwtFromRequest(req);
        if (!token) {
          throw 'No refresh token';
        }
      });
  });

  it('should be defined', () => {
    expect(refreshAuthStrategy).toBeDefined();
  });

  it('should have correct strategy name', () => {
    expect(refreshAuthStrategy.name).toEqual('jwt');
  });

  it('should validate and return the user', async () => {
    const payload: JwtPayloadDto = {
      sub: '123',
      user,
    };

    expect(await refreshAuthStrategy.validate(payload)).toEqual(payload);
  });

  it('should authenticate user with refresh token on a signed cookie', () => {
    const req: Partial<Request> = {
      signedCookies: {
        [REFRESH_TOKEN_KEY]: 'testRefreshToken',
      },
    };

    expect(() =>
      refreshAuthStrategy.authenticate(req as Request)
    ).not.toThrow();
  });

  it('should NOT authenticate user without refresh token on a signed cookie', () => {
    const req: Partial<Request> = {
      signedCookies: {
        [REFRESH_TOKEN_KEY]: null,
      },
    };

    const req2: Partial<Request> = {
      signedCookies: null,
    };

    expect(() => refreshAuthStrategy.authenticate(req as Request)).toThrowError(
      'No refresh token'
    );
    expect(() =>
      refreshAuthStrategy.authenticate(req2 as Request)
    ).toThrowError('No refresh token');
    expect(() => refreshAuthStrategy.authenticate(null)).toThrowError(
      'No refresh token'
    );
  });
});
