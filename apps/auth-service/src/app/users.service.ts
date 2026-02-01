// // apps/auth-service/src/app/users.service.ts
// import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
// import { PrismaService } from './prisma.service';
// import { UserResponseDto } from '../application/dto/user-response.dto';
// import { Role } from '../domain/value-objects/roles.enum';
// import { plainToInstance } from 'class-transformer';

// @Injectable()
// export class UsersService {
//   constructor(private prisma: PrismaService) {}

//   // ==========================================================
//   // 1. MÉTODOS DE BÚSQUEDA (Públicos o para el propio usuario)
//   // ==========================================================

//   async findByCedula(cedula: string): Promise<UserResponseDto> {
//     const user = await this.prisma.user.findUnique({
//       where: { cedula },
//     });
    
//     if (!user) {
//       throw new NotFoundException(`Usuario con cédula ${cedula} no encontrado`);
//     }
    
//     // FIX: Usamos plainToInstance para serializar correctamentee
//     return plainToInstance(UserResponseDto, user);
//   }

//   async findById(id: number): Promise<UserResponseDto> {
//     const user = await this.prisma.user.findUnique({
//       where: { id },
//     });

//     if (!user) {
//       throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
//     }

//     return plainToInstance(UserResponseDto, user);
//   }

//   // FIX CRÍTICO: Usamos '=' para valores por defecto, NO ':'
//   // Antes (Error): async findAll(page: 1, limit: 10)
//   // Ahora (Bien):  async findAll(page = 1, limit = 10)
//   async findAll(page = 1, limit = 10) {
//     const skip = (page - 1) * limit;
    
//     const [users, total] = await Promise.all([
//       this.prisma.user.findMany({
//         skip,
//         take: limit,
//         orderBy: { createdAt: 'desc' },
//       }),
//       this.prisma.user.count(),
//     ]);

//     return {
//       data: users.map(user => plainToInstance(UserResponseDto, user)),
//       meta: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit),
//       },
//     };
//   }

//   // ==========================================================
//   // 2. MÉTODOS ADMINISTRATIVOS (Requieren validación de rol)
//   // ==========================================================

//   async updateUserRole(id: number, role: Role, requesterId: number) {
//     // 1. Verificamos quién está pidiendo el cambio
//     const requester = await this.prisma.user.findUnique({
//       where: { id: requesterId },
//     });

//     // 2. Si no existe o no es ADMIN, lanzamos error 403 Forbidden
//     if (!requester || requester.role !== Role.ADMIN) {
//       throw new ForbiddenException('Solo administradores pueden cambiar roles');
//     }

//     // 3. Verificamos que el usuario objetivo exista antes de actualizar
//     const targetUser = await this.prisma.user.findUnique({ where: { id } });
//     if (!targetUser) {
//         throw new NotFoundException(`Usuario objetivo con ID ${id} no encontrado`);
//     }

//     // 4. Actualizamos
//     const user = await this.prisma.user.update({
//       where: { id },
//       data: { role },
//     });

//     return plainToInstance(UserResponseDto, user);
//   }

//   async deactivateUser(id: number, requesterId: number) {
//     // 1. Verificamos quién pide la baja .
//     const requester = await this.prisma.user.findUnique({
//       where: { id: requesterId },
//     });

//     if (!requester || requester.role !== Role.ADMIN) {
//       throw new ForbiddenException('Solo administradores pueden desactivar usuarios');
//     }

//     // 2. Verificamos objetivo
//     const targetUser = await this.prisma.user.findUnique({ where: { id } });
//     if (!targetUser) {
//         throw new NotFoundException(`Usuario objetivo con ID ${id} no encontrado`);
//     }

//     // 3. Actualizamos
//     const user = await this.prisma.user.update({
//       where: { id },
//       data: { isActive: false },
//     });

//     return plainToInstance(UserResponseDto, user);
//   }
// }

// apps/auth-service/src/app/users.service.ts
import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserResponseDto } from '../application/dto/user-response.dto';
import { CreateUserDto } from '../application/dto/create-user.dto';
import { UpdateUserDto } from '../application/dto/update-user.dto';
import { UpdateProfileDto } from '../application/dto/update-profile.dto';
import { Role } from '../domain/value-objects/roles.enum';
import { plainToInstance } from 'class-transformer'; // <--- ¡VITAL!
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ==========================================================
  // 1. MÉTODOS PARA ADMIN / HOTEL_MANAGER
  // ==========================================================

  async createUser(createUserDto: CreateUserDto, requesterId: number, requesterRole: Role): Promise<UserResponseDto> {
    // 1. Validar unicidad (Email y Cédula)
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          { cedula: createUserDto.cedula },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === createUserDto.email) throw new ConflictException('El email ya está registrado');
      if (existingUser.cedula === createUserDto.cedula) throw new ConflictException('La cédula ya está registrada');
    }

    // 2. Validación de Jerarquía: Manager solo crea Clientes
    if (requesterRole === Role.HOTEL_MANAGER && createUserDto.role !== Role.CLIENT) {
      throw new ForbiddenException('Los Hotel Managers solo pueden crear usuarios CLIENT');
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 4. Crear
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        updatedBy: requesterId, // Auditoría
      },
    });

    return plainToInstance(UserResponseDto, user); // <--- FIX: Serialización correcta
  }

  async findAll(page: number = 1, limit: number = 10, requesterRole: Role) {
    const skip = (page - 1) * limit;
    
    // Seguridad: Cliente no ve listas
    if (requesterRole === Role.CLIENT) {
      throw new ForbiddenException('No tiene permisos para ver la lista de usuarios');
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where: { deletedAt: null }, // Solo activos
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);

    return {
      data: users.map(user => plainToInstance(UserResponseDto, user)), // <--- FIX
      meta: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number, requesterId: number, requesterRole: Role): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

    // Seguridad: Cliente solo se ve a sí mismo
    if (requesterRole === Role.CLIENT && user.id !== requesterId) {
      throw new ForbiddenException('Solo puede ver su propio perfil');
    }

    return plainToInstance(UserResponseDto, user); // <--- FIX
  }

  async updateUser(
    id: number, 
    updateUserDto: UpdateUserDto, 
    requesterId: number, 
    requesterRole: Role
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundException(`Usuario no encontrado`);

    // 1. Cliente no usa este método (usa updateSelfProfile)
    if (requesterRole === Role.CLIENT) {
      throw new ForbiddenException('Use el endpoint de perfil para editar sus datos');
    }

    // 2. Restricciones de Hotel Manager
    if (requesterRole === Role.HOTEL_MANAGER) {
      // No puede tocar a un Admin ni a otro Manager
      if (user.role === Role.ADMIN || user.role === Role.HOTEL_MANAGER) {
        throw new ForbiddenException('No tiene permisos para editar a este usuario');
      }
      // No puede ascender a nadie a Admin/Manager
      if (updateUserDto.role && (updateUserDto.role === Role.ADMIN || updateUserDto.role === Role.HOTEL_MANAGER)) {
        throw new ForbiddenException('No puede asignar roles administrativos');
      }
    }

    // 3. Preparar datos
    let dataToUpdate: any = { ...updateUserDto, updatedBy: requesterId };
    
    // Si hay password nuevo, hashear
    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    return plainToInstance(UserResponseDto, updatedUser); // <--- FIX
  }

  async softDeleteUser(id: number, requesterId: number, requesterRole: Role): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundException(`Usuario no encontrado`);

    // 1. No auto-suicidio
    if (user.id === requesterId) {
      throw new ForbiddenException('No puede eliminarse a sí mismo');
    }

    // 2. Cliente no borra a nadie
    if (requesterRole === Role.CLIENT) {
      throw new ForbiddenException('No tiene permisos para eliminar usuarios');
    }

    // 3. Manager solo borra Clientes
    if (requesterRole === Role.HOTEL_MANAGER && user.role !== Role.CLIENT) {
      throw new ForbiddenException('Solo puede desactivar usuarios CLIENT');
    }

    // 4. Soft Delete (isActive = false, deletedAt = now)
    const deletedUser = await this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        updatedBy: requesterId,
      },
    });

    return plainToInstance(UserResponseDto, deletedUser); // <--- FIX
  }

  // ==========================================================
  // 2. MÉTODOS PARA CLIENTES (SELF-SERVICE)
  // ==========================================================

  async getSelfProfile(userId: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    return plainToInstance(UserResponseDto, user); // <--- FIX
  }

  async updateSelfProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<UserResponseDto> {
    // Cliente solo edita datos básicos (definidos en el DTO), nunca Roles ni isActive
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateProfileDto,
        updatedBy: userId,
      },
    });

    return plainToInstance(UserResponseDto, updatedUser); // <--- FIX
  }

  // ==========================================================
  // 3. MÉTODOS AUXILIARES (Búsqueda interna)
  // ==========================================================

  async findByCedula(cedula: string, requesterId: number, requesterRole: Role): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { cedula, deletedAt: null } });
    if (!user) throw new NotFoundException(`Usuario no encontrado`);

    // Seguridad: Si es cliente, solo puede verse a sí mismo
    if (requesterRole === Role.CLIENT && user.id !== requesterId) {
      throw new ForbiddenException('Solo puede ver su propio perfil');
    }

    return plainToInstance(UserResponseDto, user); // <--- FIX
  }
}