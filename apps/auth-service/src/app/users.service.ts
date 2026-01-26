// apps/auth-service/src/app/users.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserResponseDto } from '../application/dto/user-response.dto';
import { Role } from '../domain/value-objects/roles.enum';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByCedula(cedula: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { cedula },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con cédula ${cedula} no encontrado`);
    }

    return new UserResponseDto(user);
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return new UserResponseDto(user);
  }

  async findAll(page: number = 1, limit: number = 10) {
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
      data: users.map(user => new UserResponseDto(user)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserRole(id: number, role: Role, requesterId: number) {
    // Verificar que el solicitante es ADMIN
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

    return new UserResponseDto(user);
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

    return new UserResponseDto(user);
  }
}