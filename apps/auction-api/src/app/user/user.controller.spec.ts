import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: '1', userName: 'test', password: 'hashedPassword' }),
            findOne: jest.fn().mockResolvedValue({ id: '1', userName: 'test', password: 'hashedPassword' }),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should create and return a user', async () => {
    const createUserDto = { userName: 'test', password: 'test' };
    const user = await userController.create(createUserDto);
    expect(userService.create).toHaveBeenCalledWith(createUserDto);
    expect(user).toEqual({ id: '1', userName: 'test', password: 'hashedPassword' });
  });

  it('should find one user', async () => {
    const user = await userController.findOne('1');
    expect(userService.findOne).toHaveBeenCalledWith({ id: '1' });
    expect(user).toEqual({ id: '1', userName: 'test', password: 'hashedPassword' });
  });
});
