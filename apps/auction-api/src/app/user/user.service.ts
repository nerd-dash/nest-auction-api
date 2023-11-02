import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities';
import { HashService } from '../hash';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly entityManager: EntityManager,
    private readonly hashService: HashService
  ) {}

  async create({ userName, password }: CreateUserDto) {
    const passwordHash = await this.hashService.hash(password);
    const user: User = { userName, password: passwordHash };
    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager.save(User, user);
        return user;
      }
    );
  }

  // findAll() {
  //   return `This action returns all user`;
  // }

  findOne(user: Partial<User>) {
    return this.userRepository.findOne({
      where: {
        ...user,
      },
    });
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
