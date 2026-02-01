// todo funkia xd
// apps/auth-service/src/application/dto/user-response.dto.ts
import { Exclude, Expose } from 'class-transformer';
import { Role } from '../../domain/value-objects/roles.enum';

@Exclude()
export class UserResponseDto {
  @Expose()
  id!: number; // <--- ¡Mira el signo de admiración!

  @Expose()
  email!: string;

  @Expose()
  firstName!: string;

  @Expose()
  lastName!: string;

  @Expose()
  cedula!: string;

  @Expose()
  phone?: string; // Este puede ser opcional (?) o definitivo (!), ambos sirven.

  @Expose()
  role!: Role;

  @Expose()
  isActive!: boolean;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}