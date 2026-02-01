// import { 
//   Controller, 
//   Get, 
//   Param, 
//   UseGuards, 
//   ParseIntPipe, 
//   Query, 
//   DefaultValuePipe // <--- NECESARIO para valores por defecto
// } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport'; // <--- CORRECCIÓN 1

// import { UsersService } from '../../app/users.service';
// import { Roles } from '../../application/decorators/roles.decorator';
// import { RolesGuard } from '../../application/guards/roles.guard';
// import { Role } from '../../domain/value-objects/roles.enum';

// @Controller('users')
// // CORRECCIÓN 1: Usamos AuthGuard('jwt') estándar si no has creado tu propio archivo JwtAuthGuard
// @UseGuards(AuthGuard('jwt'), RolesGuard) 
// export class UsersController {
//   constructor(private readonly usersService: UsersService) {}

//   @Get('cedula/:cedula')
//   @Roles(Role.ADMIN, Role.HOTEL_MANAGER)
//   async findByCedula(@Param('cedula') cedula: string) {
//     return this.usersService.findByCedula(cedula);
//   }

//   @Get(':id')
//   @Roles(Role.ADMIN, Role.HOTEL_MANAGER)
//   async findById(@Param('id', ParseIntPipe) id: number) {
//     return this.usersService.findById(id);
//   }

//   @Get()
//   @Roles(Role.ADMIN)
//   // CORRECCIÓN 2: NestJS maneja los query params como strings por defecto.
//   // Usamos 'DefaultValuePipe' y 'ParseIntPipe' para transformarlos a números seguros.
//   async findAll(
//     @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
//     @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
//   ) {
//     return this.usersService.findAll(page, limit);
//   }
// }

import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  Request,
  HttpCode,
  HttpStatus,
  DefaultValuePipe, // Recuperamos esto del código viejo
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // <--- MANTENEMOS ESTO (Importante)
import { UsersService } from '../../app/users.service';
import { Roles } from '../../application/decorators/roles.decorator';
import { RolesGuard } from '../../application/guards/roles.guard';
import { Role } from '../../domain/value-objects/roles.enum';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { UpdateProfileDto } from '../../application/dto/update-profile.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard) // <--- FIX: Usamos el Guard estándar
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ==========================================================
  // 1. ENDPOINTS PÚBLICOS (Para el propio usuario)
  // ==========================================================

  @Get('me')
  async getSelfProfile(@Request() req) {
    // El ID viene del token (req.user.id)
    return this.usersService.getSelfProfile(req.user.id);
  }

  @Patch('me')
  async updateSelfProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Request() req,
  ) {
    return this.usersService.updateSelfProfile(req.user.id, updateProfileDto);
  }

  // ==========================================================
  // 2. ENDPOINTS ADMINISTRATIVOS (Admin / Hotel Manager)
  // ==========================================================

  @Post()
  @Roles(Role.ADMIN, Role.HOTEL_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto, @Request() req) {
    return this.usersService.createUser(
      createUserDto,
      req.user.id,   // Auditoría: Quién lo creó
      req.user.role, // Validación: Qué rol tiene el creador
    );
  }

  @Get()
  @Roles(Role.ADMIN, Role.HOTEL_MANAGER)
  async findAll(
    // Mantenemos tu lógica robusta de paginación del código viejo
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Request() req,
  ) {
    return this.usersService.findAll(page, limit, req.user.role);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.HOTEL_MANAGER)
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.usersService.findById(id, req.user.id, req.user.role);
  }

  @Get('cedula/:cedula')
  @Roles(Role.ADMIN, Role.HOTEL_MANAGER)
  async findByCedula(
    @Param('cedula') cedula: string,
    @Request() req,
  ) {
    return this.usersService.findByCedula(cedula, req.user.id, req.user.role);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.HOTEL_MANAGER)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    return this.usersService.updateUser(
      id,
      updateUserDto,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.HOTEL_MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDeleteUser(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.usersService.softDeleteUser(id, req.user.id, req.user.role);
  }
}