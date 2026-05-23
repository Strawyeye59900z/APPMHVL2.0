import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../common/prisma.service';
import { WhatsappService } from '../../infra/whatsapp/whatsapp.service';

const DELAY_BETWEEN_MESSAGES_MS = 1500;

@Processor('announcement-broadcast')
export class AnnouncementBroadcastProcessor {
  private readonly logger = new Logger(AnnouncementBroadcastProcessor.name);

  constructor(
    private prisma: PrismaService,
    private whatsapp: WhatsappService,
  ) {}

  @Process('broadcast')
  async handle(job: Job<{ announcementId: string }>) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: job.data.announcementId },
    });
    if (!announcement || announcement.sentToWhatsapp) return;

    const residents = await this.prisma.resident.findMany({
      where: { active: true, phone: { not: null } },
      select: { phone: true, name: true },
    });

    const message = this.whatsapp.formatAnnouncementMessage(announcement.title, announcement.body);
    let sent = 0;

    for (const resident of residents) {
      try {
        await this.whatsapp.sendText(resident.phone!, message);
        sent++;
        await new Promise(r => setTimeout(r, DELAY_BETWEEN_MESSAGES_MS));
      } catch (err) {
        this.logger.warn(`Falha ao enviar para ${resident.phone}: ${err.message}`);
      }
    }

    await this.prisma.announcement.update({
      where: { id: announcement.id },
      data: { sentToWhatsapp: true, whatsappSentAt: new Date() },
    });

    this.logger.log(`Comunicado "${announcement.title}" enviado para ${sent}/${residents.length} moradores`);
  }
}
