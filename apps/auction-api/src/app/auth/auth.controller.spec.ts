import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { REFRESH_TOKEN_KEY } from './auth.constants';
import { AuthController, RequestWithUser } from './auth.controller';
import { AuthService } from './auth.service';

const requestWithUser = {
  user: { userName: 'testUser', password: 'password' },
} as RequestWithUser;

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue({
              access_token: 'testToken',
              refresh_token: 'testRefreshToken',
            }),
            register: jest.fn().mockResolvedValue({
              id: '1',
              userName: 'test',
            }),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('/register', () => {
    const signUpDto = { username: 'test', password: 'test' };

    it('should be able to register a new user', async () => {
      const user = await authController.register(signUpDto);
      expect(authService.register).toHaveBeenCalledWith(signUpDto);
      expect(user).toEqual({
        id: '1',
        userName: 'test',
      });
    });

    it('should throw BadRequestException if user already exists', async () => {
      jest
        .spyOn(authService, 'register')
        .mockRejectedValueOnce(() => new Error('Database Error'));

      await expect(authController.register(signUpDto)).rejects.toThrow(
        new BadRequestException()
      );
    });
  });

  describe('/login', () => {
    it('should login user and set refresh token cookie', async () => {
      const res = {
        cookie: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await authController.login(requestWithUser, res);

      expect(authService.login).toHaveBeenCalledWith(requestWithUser.user);
      expect(res.cookie).toHaveBeenCalledWith(
        REFRESH_TOKEN_KEY,
        'testRefreshToken',
        { httpOnly: true, signed: true }
      );
      expect(res.send).toHaveBeenCalledWith({ access_token: 'testToken' });
    });
  });

  describe('/refresh', () => {
    it('should refresh access token', async () => {
      const result = await authController.refresh(requestWithUser);
      expect(authService.login).toHaveBeenCalledWith(requestWithUser.user);
      expect(result).toEqual({ access_token: 'testToken' });
    });

    it('should throw UnauthorizedException if no user', async () => {
      const req = { user: null } as RequestWithUser;
      await expect(authController.refresh(req)).rejects.toThrow(
        UnauthorizedException
      );

      await expect(authController.refresh(null)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});
