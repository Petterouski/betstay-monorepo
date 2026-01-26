import { 
  Controller, 
  Get, 
  Param, 
  UseGuards, 
  ParseIntPipe, 
  Query, 
  DefaultValuePipe // <--- NECESARIO para valores por defecto
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // <--- CORRECCIÓN 1

import { UsersService } from '../../app/users.service';
import { Roles } from '../../application/decorators/roles.decorator';
import { RolesGuard } from '../../application/guards/roles.guard';
import { Role } from '../../domain/value-objects/roles.enum';

@Controller('users')
// CORRECCIÓN 1: Usamos AuthGuard('jwt') estándar si no has creado tu propio archivo JwtAuthGuard
@UseGuards(AuthGuard('jwt'), RolesGuard) 
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('cedula/:cedula')
  @Roles(Role.ADMIN, Role.HOTEL_MANAGER)
  async findByCedula(@Param('cedula') cedula: string) {
    return this.usersService.findByCedula(cedula);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.HOTEL_MANAGER)
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  @Get()
  @Roles(Role.ADMIN)
  // CORRECCIÓN 2: NestJS maneja los query params como strings por defecto.
  // Usamos 'DefaultValuePipe' y 'ParseIntPipe' para transformarlos a números seguros.
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return this.usersService.findAll(page, limit);
  }
}