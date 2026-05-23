import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { PackageNotifyProcessor } from './package-notify.processor';
import { WhatsappModule } from '../../infra/whatsapp/whatsapp.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'package-notify' }),
    WhatsappModule,
  ],
  providers: [PackagesService, PackageNotifyProcessor],
  controllers: [PackagesController],
})
export class PackagesModule {}
