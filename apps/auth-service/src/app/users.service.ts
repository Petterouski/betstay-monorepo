// apps/auth-service/src/app/users.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserResponseDto } from '../application/dto/user-response.dto';
import { Role } from '../domain/value-objects/roles.enum';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // --- BUSCAR POR CÉDULA ---
  async findByCedula(cedula: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { cedula } });
    
    if (!user) {
      throw new NotFoundException(`Usuario con cédula ${cedula} no encontrado`);
    }
    
    return plainToInstance(UserResponseDto, user);
  }

  // --- BUSCAR POR ID ---
  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return plainToInstance(UserResponseDto, user);
  }

  // --- LISTAR TODOS (Corregido el error de sintaxis ':' por '=') ---
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

  // --- TUS FUNCIONES DE ADMIN (Corregidas para no dar Error 500) ---

  async updateUserRole(id: number, role: Role, requesterId: number) {
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
    });

    if (!requester || requester.role !== Role.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden cambiar roles');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: { role },
    });

    // FIX: Usamos plainToInstance en lugar de 'new'
    return plainToInstance(UserResponseDto, user);
  }

  async deactivateUser(id: number, requesterId: number) {
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
    });

    if (!requester || requester.role !== Role.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden desactivar usuarios');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    // FIX: Usamos plainToInstance en lugar de 'new'
    return plainToInstance(UserResponseDto, user);
  }
}