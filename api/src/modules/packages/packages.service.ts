import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../common/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UserRole } from '@condo/shared';

@Injectable()
export class PackagesService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('package-notify') private notifyQueue: Queue,
  ) {}

  async create(dto: CreatePackageDto, receivedById: string) {
    const pkg = await this.prisma.package.create({
      data: {
        apartmentId: dto.apartmentId,
        residentId: dto.residentId,
        type: dto.type,
        notes: dto.notes,
        receivedById,
      },
      include: {
        apartment: true,
      },
    });

    await this.notifyQueue.add(
      'send-whatsapp',
      { packageId: pkg.id },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    );

    return pkg;
  }

  findPendingByApartment(apartmentId: string) {
    return this.prisma.package.findMany({
      where: { apartmentId, pickedUpAt: null },
      include: { receivedBy: { select: { name: true } } },
      orderBy: { receivedAt: 'desc' },
    });
  }

  findAllPending() {
    return this.prisma.package.findMany({
      where: { pickedUpAt: null },
      include: {
        apartment: { select: { number: true, block: true } },
        receivedBy: { select: { name: true } },
      },
      orderBy: { receivedAt: 'desc' },
    });
  }

  async pickup(id: string, residentId: string, apartmentId: string) {
    const pkg = await this.prisma.package.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException('Encomenda não encontrada');
    if (pkg.apartmentId !== apartmentId) throw new ForbiddenException('Sem permissão');
    if (pkg.pickedUpAt) throw new ForbiddenException('Encomenda já retirada');

    return this.prisma.package.update({
      where: { id },
      data: { pickedUpAt: new Date(), pickedUpById: residentId },
    });
  }

  findHistory(apartmentId: string, take = 50) {
    return this.prisma.package.findMany({
      where: { apartmentId, pickedUpAt: { not: null } },
      include: { pickedUpBy: { select: { name: true } } },
      orderBy: { pickedUpAt: 'desc' },
      take,
    });
  }
}
