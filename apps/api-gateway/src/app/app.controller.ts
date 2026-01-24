import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Cuando entres a http://IP:3000/status, se ejecuta esto:
  @Get('status')
  getData() {
    return this.appService.getSystemStatus();
  }
  
  // Dejamos la ruta raíz también por si acaso
  @Get()
  getRoot() {
    return { message: 'Bienvenido a BetStay API Gateway' };
  }
}