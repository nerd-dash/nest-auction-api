import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { EntityManager, Repository } from 'typeorm';
import { HashService } from '../hash/hash.service';
import { User } from './entities';
import { CreateUserDto } from './dto';

describe('UserService', () => {
  let userService: UserService;
  let hashService: HashService;
  let entityManager: EntityManager;
  let userRepository: Repository<User>;
  const createUserDto: CreateUserDto = {
    userName: 'test',
    password: 'hashed_password',
  };
  const userDto: User = { id: '1', ...createUserDto };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: HashService,
          useValue: {
            hash: jest.fn().mockResolvedValue(userDto.password),
          },
        },
        {
          provide: EntityManager,
          useValue: {
            transaction: jest
              .fn()
              .mockImplementation((cb) => cb({ save: jest.fn() })),
          },
        },
        {
          provide: 'UserRepository',
          useValue: {
            findOne: jest.fn().mockResolvedValue(userDto),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    hashService = module.get<HashService>(HashService);
    entityManager = module.get<EntityManager>(EntityManager);
    userRepository = module.get<Repository<User>>('UserRepository');
  });

  describe('create', () => {
    it('should create and save a user', async () => {
      const user = await userService.create(userDto);
      expect(hashService.hash).toHaveBeenCalledWith(userDto.password);
      expect(entityManager.transaction).toHaveBeenCalled();
      expect(user).toEqual({
        userName: userDto.userName,
        password: userDto.password,
      });
    });
  });

  describe('findOne', () => {
    it('should find one user', async () => {
      const user = await userService.findOne({
        userName: createUserDto.userName,
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { userName: createUserDto.userName },
      });
      expect(user).toEqual(userDto);
    });

    it('should throw an error if user is not found', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(undefined as any);
      await expect(
        userService.findOne({ userName: createUserDto.userName })
      ).rejects.toThrow();
    });
  });
});
