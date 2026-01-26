// apps/auth-service/src/infrastructure/controllers/users.controller.ts
import { Controller, Get, Param, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { UsersService } from '../../app/users.service';
import { Roles } from '../../application/decorators/roles.decorator';
import { RolesGuard } from '../../application/guards/roles.guard';
import { Role } from '../../domain/value-objects/roles.enum';
import { JwtAuthGuard } from '@nestjs/passport';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
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
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.usersService.findAll(page, limit);
  }
}