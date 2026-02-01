import { IsEmail, IsEnum, IsOptional, IsString, MinLength, Matches, Length, IsBoolean } from 'class-validator';
import { Role } from '../../domain/value-objects/roles.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'La cédula debe contener solo números' })
  @Length(10, 10, { message: 'La cédula debe tener exactamente 10 dígitos' })
  cedula?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}