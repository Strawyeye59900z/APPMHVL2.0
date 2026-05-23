import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './common/prisma.module';
import { WhatsappModule } from './infra/whatsapp/whatsapp.module';
import { DriveModule } from './infra/drive/drive.module';
import { AuthModule } from './modules/auth/auth.module';
import { ApartmentsModule } from './modules/apartments/apartments.module';
import { ResidentsModule } from './modules/residents/residents.module';
import { PackagesModule } from './modules/packages/packages.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { FacialModule } from './modules/facial/facial.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),
    PrismaModule,
    WhatsappModule,
    DriveModule,
    AuthModule,
    ApartmentsModule,
    ResidentsModule,
    PackagesModule,
    ReservationsModule,
    FacialModule,
    AnnouncementsModule,
    ReportsModule,
  ],
})
export class AppModule {}
