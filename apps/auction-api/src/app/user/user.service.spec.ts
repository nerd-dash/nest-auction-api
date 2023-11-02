import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { EntityManager, Repository } from 'typeorm';
import { HashService } from '../hash/hash.service';
import { User } from './entities';

describe('UserService', () => {
  let userService: UserService;
  let hashService: HashService;
  let entityManager: EntityManager;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: HashService,
          useValue: {
            hash: jest.fn().mockResolvedValue('hashedPassword'),
          },
        },
        {
          provide: EntityManager,
          useValue: {
            transaction: jest.fn().mockImplementation((cb) => cb({ save: jest.fn() })),
          },
        },
        {
          provide: 'UserRepository',
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id: '1', userName: 'test', password: 'hashedPassword' }),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    hashService = module.get<HashService>(HashService);
    entityManager = module.get<EntityManager>(EntityManager);
    userRepository = module.get<Repository<User>>('UserRepository');
  });

  it('should create and save a user', async () => {
    const userDto = { userName: 'test', password: 'test' };
    const user = await userService.create(userDto);
    expect(hashService.hash).toHaveBeenCalledWith(userDto.password);
    expect(entityManager.transaction).toHaveBeenCalled();
    expect(user).toEqual({ userName: userDto.userName, password: 'hashedPassword' });
  });

  it('should find one user', async () => {
    const user = await userService.findOne({ userName: 'test' });
    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { userName: 'test' } });
    expect(user).toEqual({ id: '1', userName: 'test', password: 'hashedPassword' });
  });
});
