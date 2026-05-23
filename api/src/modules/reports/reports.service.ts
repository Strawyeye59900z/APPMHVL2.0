import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { ReservationsService } from '../reservations/reservations.service';

@Injectable()
export class ReportsService {
  constructor(private reservations: ReservationsService) {}

  async generateReservationsPdf(from: string, to: string): Promise<Buffer> {
    const data = await this.reservations.findAll(from, to);

    const spaceNames: Record<string, string> = {
      COURT: 'Quadra',
      BBQ: 'Churrasqueira',
      HALL: 'Salão de Festas',
    };

    const rows = data
      .map(r => {
        const start = new Intl.DateTimeFormat('pt-BR', {
          dateStyle: 'short',
          timeStyle: 'short',
          timeZone: 'America/Sao_Paulo',
        }).format(r.startsAt);
        const end = new Intl.DateTimeFormat('pt-BR', {
          timeStyle: 'short',
          timeZone: 'America/Sao_Paulo',
        }).format(r.endsAt);

        return `
          <tr>
            <td>${(r as any).apartment?.number ?? ''}</td>
            <td>${(r as any).resident?.name ?? ''}</td>
            <td>${spaceNames[r.spaceType] ?? r.spaceType}</td>
            <td>${start} – ${end}</td>
          </tr>`;
      })
      .join('');

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8"/>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          h1 { color: #1a56db; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #1a56db; color: white; padding: 10px; text-align: left; }
          td { padding: 8px 10px; border-bottom: 1px solid #e0e0e0; }
          tr:nth-child(even) { background: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>Relatório de Reservas</h1>
        <p>Período: ${new Date(from).toLocaleDateString('pt-BR')} a ${new Date(to).toLocaleDateString('pt-BR')}</p>
        <table>
          <thead>
            <tr><th>Apto</th><th>Morador</th><th>Espaço</th><th>Período</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin-top:30px;color:#888;font-size:12px">
          Gerado em ${new Date().toLocaleString('pt-BR')}
        </p>
      </body>
      </html>`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } });
    await browser.close();
    return Buffer.from(pdf);
  }
}
