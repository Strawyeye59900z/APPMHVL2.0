import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../common/prisma.service';
import { WhatsappService } from '../../infra/whatsapp/whatsapp.service';

@Processor('package-notify')
export class PackageNotifyProcessor {
  private readonly logger = new Logger(PackageNotifyProcessor.name);

  constructor(
    private prisma: PrismaService,
    private whatsapp: WhatsappService,
  ) {}

  @Process('send-whatsapp')
  async handleNotify(job: Job<{ packageId: string }>) {
    const pkg = await this.prisma.package.findUnique({
      where: { id: job.data.packageId },
      include: {
        apartment: { include: { residents: { where: { active: true } } } },
      },
    });

    if (!pkg || pkg.whatsappSent) return;

    const time = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    }).format(pkg.receivedAt);

    const residents = pkg.apartment.residents.filter(r => r.phone);
    if (residents.length === 0) {
      this.logger.warn(`Nenhum morador com telefone no AP ${pkg.apartmentId}`);
      return;
    }

    for (const resident of residents) {
      const msg = this.whatsapp.formatPackageMessage(resident.name, pkg.type, time);
      await this.whatsapp.sendText(resident.phone!, msg);
    }

    await this.prisma.package.update({
      where: { id: pkg.id },
      data: { whatsappSent: true },
    });

    this.logger.log(`Notificação enviada para AP ${pkg.apartmentId}`);
  }
}
