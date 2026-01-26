// apps/auth-service/src/app/auth.service.ts
import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../application/dto/register.dto';
import { LoginDto } from '../application/dto/login.dto';
import { UserResponseDto } from '../application/dto/user-response.dto';
import { Role } from '../domain/value-objects/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<UserResponseDto> {
  // Validar unicidad de email y cédula (mantén esta parte igual)
  const existingUser = await this.prisma.user.findFirst({
    where: {
      OR: [
        { email: registerDto.email },
        { cedula: registerDto.cedula },
      ],
    },
  });

  if (existingUser) {
    if (existingUser.email === registerDto.email) {
      throw new ConflictException('El email ya está registrado');
    }
    if (existingUser.cedula === registerDto.cedula) {
      throw new ConflictException('La cédula ya está registrada');
    }
  }

  // Hash de la contraseña (mantén igual)
  const hashedPassword = await bcrypt.hash(registerDto.password, 10);

  // Crear usuario (mantén igual)
  const user = await this.prisma.user.create({
    data: {
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      cedula: registerDto.cedula, // Ahora acepta solo números de 10 dígitos
      phone: registerDto.phone,
      role: registerDto.role || Role.CLIENT,
    },
  });

  return new UserResponseDto(user);
}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: new UserResponseDto(user),
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}