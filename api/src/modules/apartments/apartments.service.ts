import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';

@Injectable()
export class ApartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApartmentDto) {
    const exists = await this.prisma.apartment.findUnique({ where: { number: dto.number } });
    if (exists) throw new ConflictException('Apartamento já cadastrado');

    const hash = await bcrypt.hash(dto.defaultPassword, 10);
    return this.prisma.apartment.create({
      data: {
        number: dto.number,
        block: dto.block,
        defaultPasswordHash: hash,
      },
    });
  }

  findAll() {
    return this.prisma.apartment.findMany({
      include: {
        residents: { where: { active: true }, select: { id: true, name: true, isOwner: true } },
        _count: { select: { packages: { where: { pickedUpAt: null } } } },
      },
      orderBy: { number: 'asc' },
    });
  }

  async findOne(number: string) {
    const apt = await this.prisma.apartment.findUnique({
      where: { number },
      include: {
        residents: { where: { active: true } },
        packages: { where: { pickedUpAt: null }, orderBy: { receivedAt: 'desc' } },
      },
    });
    if (!apt) throw new NotFoundException('Apartamento não encontrado');
    return apt;
  }

  async resetPassword(number: string, newPassword: string) {
    const hash = await bcrypt.hash(newPassword, 10);
    return this.prisma.apartment.update({
      where: { number },
      data: { defaultPasswordHash: hash },
    });
  }

  getResidents(apartmentNumber: string) {
    return this.prisma.resident.findMany({
      where: { apartmentId: apartmentNumber, active: true },
      orderBy: { name: 'asc' },
    });
  }

  async remove(number: string) {
    await this.findOne(number);
    return this.prisma.apartment.delete({ where: { number } });
  }
}
