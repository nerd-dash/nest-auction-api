import { User } from '../../user';

export class JwtPayloadDto {
  sub: string;
  user: User;
}
