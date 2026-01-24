import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // <--- Importamos la herramienta HTTP
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [HttpModule], // <--- Aquí la registramos para poder usarla
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}