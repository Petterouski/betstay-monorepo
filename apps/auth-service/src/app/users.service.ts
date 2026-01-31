// apps/auth-service/src/app/users.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserResponseDto } from '../application/dto/user-response.dto';
import { Role } from '../domain/value-objects/roles.enum';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ==========================================================
  // 1. MÉTODOS DE BÚSQUEDA (Públicos o para el propio usuario)
  // ==========================================================

  async findByCedula(cedula: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { cedula },
    });
    
    if (!user) {
      throw new NotFoundException(`Usuario con cédula ${cedula} no encontrado`);
    }
    
    // FIX: Usamos plainToInstance para serializar correctamentee
    return plainToInstance(UserResponseDto, user);
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return plainToInstance(UserResponseDto, user);
  }

  // FIX CRÍTICO: Usamos '=' para valores por defecto, NO ':'
  // Antes (Error): async findAll(page: 1, limit: 10)
  // Ahora (Bien):  async findAll(page = 1, limit = 10)
  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users.map(user => plainToInstance(UserResponseDto, user)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==========================================================
  // 2. MÉTODOS ADMINISTRATIVOS (Requieren validación de rol)
  // ==========================================================

  async updateUserRole(id: number, role: Role, requesterId: number) {
    // 1. Verificamos quién está pidiendo el cambio
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
    });

    // 2. Si no existe o no es ADMIN, lanzamos error 403 Forbidden
    if (!requester || requester.role !== Role.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden cambiar roles');
    }

    // 3. Verificamos que el usuario objetivo exista antes de actualizar
    const targetUser = await this.prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
        throw new NotFoundException(`Usuario objetivo con ID ${id} no encontrado`);
    }

    // 4. Actualizamos
    const user = await this.prisma.user.update({
      where: { id },
      data: { role },
    });

    return plainToInstance(UserResponseDto, user);
  }

  async deactivateUser(id: number, requesterId: number) {
    // 1. Verificamos quién pide la baja .
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
    });

    if (!requester || requester.role !== Role.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden desactivar usuarios');
    }

    // 2. Verificamos objetivo
    const targetUser = await this.prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
        throw new NotFoundException(`Usuario objetivo con ID ${id} no encontrado`);
    }

    // 3. Actualizamos
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return plainToInstance(UserResponseDto, user);
  }
}