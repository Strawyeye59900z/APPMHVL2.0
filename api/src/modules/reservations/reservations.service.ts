import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { SpaceType, UserRole } from '@condo/shared';

const COURT_MAX_HOURS_PER_DAY = 4;
const COURT_BLOCK_HOURS = 1;

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  private startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private endOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  private hoursDiff(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  async create(dto: CreateReservationDto, apartmentId: string) {
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);

    if (endsAt <= startsAt) {
      throw new BadRequestException('Data de término deve ser após o início');
    }

    if (dto.spaceType === SpaceType.COURT) {
      await this.validateCourtReservation(startsAt, endsAt, apartmentId);
    } else {
      await this.validateDailyReservation(dto.spaceType, startsAt);
    }

    return this.prisma.reservation.create({
      data: {
        spaceType: dto.spaceType,
        apartmentId,
        residentId: dto.residentId,
        startsAt,
        endsAt,
      },
      include: { resident: { select: { name: true } } },
    });
  }

  private async validateCourtReservation(startsAt: Date, endsAt: Date, apartmentId: string) {
    const hours = this.hoursDiff(startsAt, endsAt);
    if (hours !== COURT_BLOCK_HOURS) {
      throw new BadRequestException('Reserva da quadra deve ser de exatamente 1 hora');
    }

    const dayStart = this.startOfDay(startsAt);
    const dayEnd = this.endOfDay(startsAt);

    const existingHours = await this.prisma.reservation.findMany({
      where: {
        spaceType: SpaceType.COURT,
        apartmentId,
        status: 'ACTIVE',
        startsAt: { gte: dayStart, lte: dayEnd },
      },
    });

    const usedHours = existingHours.reduce(
      (acc, r) => acc + this.hoursDiff(r.startsAt, r.endsAt),
      0,
    );

    if (usedHours + hours > COURT_MAX_HOURS_PER_DAY) {
      throw new BadRequestException(
        `Limite de ${COURT_MAX_HOURS_PER_DAY}h/dia por apartamento na quadra atingido`,
      );
    }

    const overlap = await this.prisma.reservation.findFirst({
      where: {
        spaceType: SpaceType.COURT,
        status: 'ACTIVE',
        OR: [
          { startsAt: { lt: endsAt }, endsAt: { gt: startsAt } },
        ],
      },
    });

    if (overlap) {
      throw new ConflictException('Horário já reservado para a quadra');
    }
  }

  private async validateDailyReservation(spaceType: SpaceType, startsAt: Date) {
    const dayStart = this.startOfDay(startsAt);
    const dayEnd = this.endOfDay(startsAt);

    const existing = await this.prisma.reservation.findFirst({
      where: {
        spaceType,
        status: 'ACTIVE',
        startsAt: { gte: dayStart, lte: dayEnd },
      },
    });

    if (existing) {
      throw new ConflictException(`${spaceType} já reservado para este dia`);
    }
  }

  findAll(from?: string, to?: string) {
    return this.prisma.reservation.findMany({
      where: {
        status: 'ACTIVE',
        ...(from && to
          ? { startsAt: { gte: new Date(from), lte: new Date(to) } }
          : {}),
      },
      include: {
        apartment: { select: { number: true, block: true } },
        resident: { select: { name: true } },
      },
      orderBy: { startsAt: 'asc' },
    });
  }

  findByApartment(apartmentId: string) {
    return this.prisma.reservation.findMany({
      where: { apartmentId, status: 'ACTIVE' },
      orderBy: { startsAt: 'asc' },
    });
  }

  async cancel(id: string, requesterId: string, requesterRole: UserRole) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) throw new NotFoundException('Reserva não encontrada');

    if (requesterRole !== UserRole.ADMIN && reservation.apartmentId !== requesterId) {
      throw new ForbiddenException('Sem permissão para cancelar esta reserva');
    }

    return this.prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
