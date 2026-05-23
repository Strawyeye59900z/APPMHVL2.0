import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { DriveService } from '../../infra/drive/drive.service';
import { PrismaService } from '../../common/prisma.service';

@Processor('facial-upload')
export class FacialUploadProcessor {
  private readonly logger = new Logger(FacialUploadProcessor.name);

  constructor(
    private drive: DriveService,
    private prisma: PrismaService,
  ) {}

  @Process('upload-to-drive')
  async handleUpload(job: Job<{
    residentId: string;
    apartmentNumber: string;
    buffer: string;
    originalName: string;
  }>) {
    const { residentId, apartmentNumber, buffer, originalName } = job.data;

    const resident = await this.prisma.resident.findUnique({ where: { id: residentId } });
    if (!resident) return;

    const fileBuffer = Buffer.from(buffer, 'base64');
    const fileName = `AP${apartmentNumber}_${resident.name.replace(/\s+/g, '_')}.jpg`;

    const { id, webViewLink } = await this.drive.uploadPhoto(fileBuffer, fileName, apartmentNumber);

    await this.prisma.resident.update({
      where: { id: residentId },
      data: { photoDriveId: id, photoUrl: webViewLink },
    });

    this.logger.log(`Foto de ${resident.name} (AP${apartmentNumber}) enviada ao Drive`);
  }
}
