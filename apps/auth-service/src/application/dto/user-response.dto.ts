// // apps/auth-service/src/application/dto/user-response.dto.ts
// import { Role } from '../../domain/value-objects/roles.enum';

// export class UserResponseDto {
//   id: number;
//   email: string;
//   firstName: string;
//   lastName: string;
//   cedula: string;
//   phone?: string;
//   role: Role;
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;

//   constructor(user: any) {
//     this.id = user.id;
//     this.email = user.email;
//     this.firstName = user.firstName;
//     this.lastName = user.lastName;
//     this.cedula = user.cedula;
//     this.phone = user.phone;
//     this.role = user.role;
//     this.isActive = user.isActive;
//     this.createdAt = user.createdAt;
//     this.updatedAt = user.updatedAt;
//   }
// }

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