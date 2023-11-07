import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { HashService } from './hash.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('HashService', () => {
  let hashService: HashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HashService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('10'),
          },
        },
      ],
    }).compile();

    hashService = module.get<HashService>(HashService);
  });

  it('should hash password', async () => {
    const result = await hashService.hash('password');
    expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    expect(result).toEqual('hashedPassword');
  });

  it('should compare password and hash', async () => {
    const result = await hashService.compare('password', 'hashedPassword');
    expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    expect(result).toBe(true);
  });
});
