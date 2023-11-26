import { Catch, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  EntityNotFoundError,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { HashService } from '../hash';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities';

@Injectable()
@Catch(QueryFailedError, EntityNotFoundError)
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly entityManager: EntityManager,
    private readonly hashService: HashService
  ) {}

  async create({ userName, password }: CreateUserDto) {
    const passwordHash = await this.hashService.hash(password);
    const user: User = { userName, password: passwordHash };
    return await this.entityManager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager.save(User, user);
        return user;
      }
    );
  }

  // findAll() {
  //   return `This action returns all user`;
  // }

  async findOne(user: Partial<User>) {
    return await this.userRepository
      .findOne({
        where: {
          ...user,
        },
      })
      .then((user) => user || Promise.reject(new NotFoundException()));
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
