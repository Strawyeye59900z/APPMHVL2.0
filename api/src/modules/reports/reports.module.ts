import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReservationsModule } from '../reservations/reservations.module';

@Module({
  imports: [ReservationsModule],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
