// apps/auth-service/src/application/dto/user-response.dto.ts
import { Role } from '../../domain/value-objects/roles.enum';

export class UserResponseDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  cedula: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: any) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.cedula = user.cedula;
    this.phone = user.phone;
    this.role = user.role;
    this.isActive = user.isActive;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}