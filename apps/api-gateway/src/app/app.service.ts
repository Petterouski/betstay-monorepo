import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  async getSystemStatus() {
    // 1. Leemos las direcciones de las Variables de Entorno (o usamos localhost si fallan)
    const bookingUrl = process.env.BOOKING_SERVICE_URL || 'http://localhost:3003';
    const bettingUrl = process.env.BETTING_SERVICE_URL || 'http://localhost:3006';

    console.log(`📡 Llamando a Booking en: ${bookingUrl}`);
    console.log(`📡 Llamando a Betting en: ${bettingUrl}`);

    // 2. Variables para guardar las respuestas
    let bookingData = { status: 'DOWN', error: 'No responde' };
    let bettingData = { status: 'DOWN', error: 'No responde' };

    // 3. Intentamos llamar al Booking Engine (Go)
    try {
      const response = await firstValueFrom(this.httpService.get(bookingUrl));
      bookingData = response.data; // Si responde, guardamos sus datos
    } catch (error) {
      console.error('Error contactando Booking:', error.message);
    }

    // 4. Intentamos llamar al Betting Engine (Python)
    try {
      // Nota: Python a veces pide la ruta exacta, así que aseguramos que sea la raíz
      const response = await firstValueFrom(this.httpService.get(bettingUrl));
      bettingData = response.data; // Si responde, guardamos sus datos
    } catch (error) {
      console.error('Error contactando Betting:', error.message);
    }

    // 5. Armamos el reporte final unificado
    return {
      gateway_status: 'Online 🟢',
      timestamp: new Date().toISOString(),
      services: {
        booking_engine: bookingData, // Aquí va lo que respondió Go
        betting_engine: bettingData, // Aquí va lo que respondió Python
      }
    };
  }
}