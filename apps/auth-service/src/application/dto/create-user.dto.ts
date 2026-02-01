import { IsEmail, IsEnum, IsOptional, IsString, MinLength, IsNotEmpty, Matches, Length } from 'class-validator';
import { Role } from '../../domain/value-objects/roles.enum';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'La cédula debe contener solo números' })
  @Length(10, 10, { message: 'La cédula debe tener exactamente 10 dígitos' })
  cedula: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.CLIENT;
}