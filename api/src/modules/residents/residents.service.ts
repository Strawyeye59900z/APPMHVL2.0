import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UserRole } from '@condo/shared';

@Injectable()
export class ResidentsService {
  constructor(private prisma: PrismaService) {}

  async create(apartmentId: string, dto: CreateResidentDto) {
    const apt = await this.prisma.apartment.findUnique({ where: { number: apartmentId } });
    if (!apt) throw new NotFoundException('Apartamento não encontrado');

    return this.prisma.resident.create({
      data: {
        apartmentId,
        name: dto.name,
        phone: dto.phone,
        isOwner: dto.isOwner ?? false,
      },
    });
  }

  findByApartment(apartmentId: string) {
    return this.prisma.resident.findMany({
      where: { apartmentId, active: true },
      orderBy: { isOwner: 'desc' },
    });
  }

  async findOne(id: string) {
    const resident = await this.prisma.resident.findUnique({ where: { id } });
    if (!resident) throw new NotFoundException('Morador não encontrado');
    return resident;
  }

  async update(id: string, data: Partial<CreateResidentDto>, requesterId: string, requesterRole: UserRole) {
    const resident = await this.findOne(id);
    if (requesterRole === UserRole.RESIDENT && resident.apartmentId !== requesterId) {
      throw new ForbiddenException('Sem permissão para editar este morador');
    }
    return this.prisma.resident.update({ where: { id }, data });
  }

  async deactivate(id: string) {
    await this.findOne(id);
    return this.prisma.resident.update({ where: { id }, data: { active: false } });
  }

  async updateFacialStatus(id: string, status: 'PENDING' | 'REGISTERED') {
    return this.prisma.resident.update({
      where: { id },
      data: { facialStatus: status },
    });
  }

  getFacialQueue() {
    return this.prisma.resident.findFirst({
      where: { facialStatus: 'PENDING', active: true, photoDriveId: { not: null } },
      orderBy: { createdAt: 'asc' },
      include: { apartment: { select: { number: true, block: true } } },
    });
  }
}
