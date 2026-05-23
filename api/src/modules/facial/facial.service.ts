import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../common/prisma.service';
import { ResidentsService } from '../residents/residents.service';

const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1MB

@Injectable()
export class FacialService {
  constructor(
    private prisma: PrismaService,
    private residents: ResidentsService,
    @InjectQueue('facial-upload') private uploadQueue: Queue,
  ) {}

  async uploadPhoto(residentId: string, file: Express.Multer.File) {
    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException('Foto deve ter menos de 1MB');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Arquivo deve ser uma imagem');
    }

    const resident = await this.residents.findOne(residentId);

    await this.uploadQueue.add(
      'upload-to-drive',
      {
        residentId,
        apartmentNumber: resident.apartmentId,
        buffer: file.buffer.toString('base64'),
        originalName: file.originalname,
      },
      { attempts: 3, backoff: { type: 'exponential', delay: 3000 } },
    );

    return { queued: true };
  }

  async getQueueNext() {
    return this.residents.getFacialQueue();
  }

  async markRegistered(residentId: string) {
    await this.residents.updateFacialStatus(residentId, 'REGISTERED');
    return this.residents.getFacialQueue();
  }

  async getPhotoStream(residentId: string) {
    const resident = await this.residents.findOne(residentId);
    if (!resident.photoDriveId) throw new NotFoundException('Foto não encontrada');
    return { driveId: resident.photoDriveId, residentName: resident.name, apartmentId: resident.apartmentId };
  }
}
