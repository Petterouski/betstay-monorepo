// /**
//  * This is not a production server yet!
//  * This is only a minimal backend to get started.
//  */

// import { Logger } from '@nestjs/common';
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app/app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   const globalPrefix = 'api';
//   app.setGlobalPrefix(globalPrefix);
  
//   // AQUI EL CAMBIO: Definir el puerto 3001
//   const port = process.env.PORT || 3001; 
  
//   await app.listen(port);
  
//   // Usamos Logger nativo (mucho mejor que console.log)
//   Logger.log(
//     `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
//   );
// }

// bootstrap();
/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common'; // <--- AGREGAMOS ValidationPipe AQUÍ
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // === AQUI LA NUEVA CONFIGURACIÓN DE VALIDACIÓN ===
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // Elimina campos que no estén en el DTO (Seguridad)
    forbidNonWhitelisted: true, // Lanza error si envían campos basura
    transform: true,            // Convierte tipos automáticamente (ej: "1" a 1)
  }));
  // =================================================

  // Mantenemos tu puerto 3001
  const port = process.env.PORT || 3001;
  
  await app.listen(port);
  
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();