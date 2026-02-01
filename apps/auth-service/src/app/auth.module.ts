// import { Module } from '@nestjs/common';
// import { PassportModule } from '@nestjs/passport';
// import { JwtModule } from '@nestjs/jwt';
// import { ConfigModule, ConfigService } from '@nestjs/config'; // <--- Importante
// import { AuthService } from './auth.service';
// import { AuthController } from '../infrastructure/controllers/auth.controller';
// import { JwtStrategy } from '../infrastructure/strategies/jwt.strategy';
// import { PrismaService } from './prisma.service';
// import { UsersService } from './users.service';

// @Module({
//   imports: [
//     // --- EL FIX: Agrega esto aquí ---
//     ConfigModule, 
//     // --------------------------------
    
//     PassportModule.register({ defaultStrategy: 'jwt' }),
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: async (configService: ConfigService) => ({
//         secret: configService.get<string>('JWT_SECRET'),
//         signOptions: {
//           expiresIn: '24h',
//         },
//       }),
//     }),
//   ],
//   controllers: [AuthController],
//   // Asegúrate de que JwtStrategy esté aquí
//   providers: [AuthService, UsersService, JwtStrategy, PrismaService], 
//   exports: [AuthService, JwtStrategy, PassportModule],
// })
// export class AuthModule {}

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from '../infrastructure/controllers/auth.controller';
import { UsersController } from '../infrastructure/controllers/users.controller'; // <--- IMPORTANTE: Nuevo Controller
import { JwtStrategy } from '../infrastructure/strategies/jwt.strategy';
import { PrismaService } from './prisma.service';
import { UsersService } from './users.service';

@Module({
  imports: [
    // --- MANTENEMOS TU FIX ANTERIOR ---
    ConfigModule, 
    // ----------------------------------

    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '24h',
        },
      }),
    }),
  ],
  // REGISTRAMOS LOS DOS CONTROLADORES
  controllers: [AuthController, UsersController], 
  
  providers: [AuthService, UsersService, JwtStrategy, PrismaService],
  
  // EXPORTAMOS TODO (Por si acaso se necesite fuera)
  exports: [AuthService, UsersService, JwtStrategy, PassportModule], 
})
export class AuthModule {}