import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementBroadcastProcessor } from './announcement-broadcast.processor';
import { WhatsappModule } from '../../infra/whatsapp/whatsapp.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'announcement-broadcast' }),
    WhatsappModule,
  ],
  providers: [AnnouncementsService, AnnouncementBroadcastProcessor],
  controllers: [AnnouncementsController],
})
export class AnnouncementsModule {}
