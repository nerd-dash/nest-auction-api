import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  private readonly saltOrRounds: number;

  constructor(private readonly configService: ConfigService) {
    this.saltOrRounds = +this.configService.getOrThrow<number>('SALT_OR_ROUNDS');
  }

  public async hash(password: string) {
    return await bcrypt.hash(password, this.saltOrRounds);
  }

  public async compare(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
}
