import { Module } from '@nestjs/common';
import { ApartmentsService } from './apartments.service';
import { ApartmentsController } from './apartments.controller';

@Module({
  providers: [ApartmentsService],
  controllers: [ApartmentsController],
  exports: [ApartmentsService],
})
export class ApartmentsModule {}
