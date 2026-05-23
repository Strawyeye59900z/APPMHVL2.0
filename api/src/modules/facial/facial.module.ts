import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { FacialController } from './facial.controller';
import { FacialService } from './facial.service';
import { FacialUploadProcessor } from './facial-upload.processor';
import { DriveModule } from '../../infra/drive/drive.module';
import { ResidentsModule } from '../residents/residents.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'facial-upload' }),
    DriveModule,
    ResidentsModule,
  ],
  providers: [FacialService, FacialUploadProcessor],
  controllers: [FacialController],
})
export class FacialModule {}
