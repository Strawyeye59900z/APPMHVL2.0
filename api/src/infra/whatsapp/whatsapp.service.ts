import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly instance: string;

  constructor(private config: ConfigService) {
    this.baseUrl = config.get('EVOLUTION_API_URL', 'http://evolution-api:8080');
    this.apiKey = config.get('EVOLUTION_API_KEY', '');
    this.instance = config.get('EVOLUTION_INSTANCE', 'portaria');
  }

  async sendText(phone: string, message: string): Promise<void> {
    const number = phone.replace(/\D/g, '');
    const formatted = number.length === 11 ? `55${number}` : number;

    try {
      await axios.post(
        `${this.baseUrl}/message/sendText/${this.instance}`,
        { number: `${formatted}@s.whatsapp.net`, text: message },
        { headers: { apikey: this.apiKey } },
      );
    } catch (err) {
      this.logger.error(`Falha ao enviar WhatsApp para ${phone}: ${err.message}`);
      throw err;
    }
  }

  formatPackageMessage(residentName: string, packageType: string, time: string): string {
    const typeMap: Record<string, string> = { BOX: 'Caixa', ENVELOPE: 'Envelope', BAG: 'Sacola' };
    return `Olá, ${residentName}! Uma encomenda tipo ${typeMap[packageType] ?? packageType} foi recebida na portaria hoje às ${time}.`;
  }

  formatAnnouncementMessage(title: string, body: string): string {
    return `📢 *${title}*\n\n${body}`;
  }
}
