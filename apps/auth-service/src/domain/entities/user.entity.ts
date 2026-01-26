// apps/auth-service/src/domain/entities/user.entity.ts
export class User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  cedula: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  isAdmin(): boolean {
    return this.role === Role.ADMIN;
  }

  isHotelManager(): boolean {
    return this.role === Role.HOTEL_MANAGER;
  }

  isClient(): boolean {
    return this.role === Role.CLIENT;
  }
}