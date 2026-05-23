import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../common/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('announcement-broadcast') private broadcastQueue: Queue,
  ) {}

  async create(dto: CreateAnnouncementDto, authorId: string) {
    const announcement = await this.prisma.announcement.create({
      data: {
        title: dto.title,
        body: dto.body,
        authorId,
        sentToWhatsapp: false,
      },
    });

    if (dto.sendToWhatsapp) {
      await this.broadcastQueue.add(
        'broadcast',
        { announcementId: announcement.id },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
      );
    }

    return announcement;
  }

  findAll(take = 50) {
    return this.prisma.announcement.findMany({
      include: { author: { select: { name: true } } },
      orderBy: { publishedAt: 'desc' },
      take,
    });
  }

  findRecent(take = 20) {
    return this.prisma.announcement.findMany({
      select: { id: true, title: true, body: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
      take,
    });
  }
}
