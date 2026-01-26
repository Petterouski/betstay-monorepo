import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

// 1. IMPORTA TUS MÓDULOS (Asegúrate de que las rutas sean correctas)
import { AuthModule } from './auth.module'; 
import { UsersModule } from './users.module';

@Module({
  imports: [
    // 2. REGÍSTRALOS AQUÍ
    AuthModule, 
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}