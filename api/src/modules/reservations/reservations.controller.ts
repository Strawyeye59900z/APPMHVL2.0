import {
  Controller, Get, Post, Patch, Param, Body, UseGuards, Req, Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { UserRole } from '@condo/shared';

@ApiTags('reservations')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private service: ReservationsService) {}

  @Post()
  @Roles(UserRole.RESIDENT, UserRole.ADMIN)
  create(@Body() dto: CreateReservationDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.service.create(dto, user.apartmentId ?? user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.RESIDENT)
  findAll(@Query('from') from?: string, @Query('to') to?: string) {
    return this.service.findAll(from, to);
  }

  @Get('my')
  @Roles(UserRole.RESIDENT)
  findMy(@Req() req: Request) {
    const user = (req as any).user;
    return this.service.findByApartment(user.apartmentId);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.RESIDENT, UserRole.ADMIN)
  cancel(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.service.cancel(id, user.apartmentId ?? user.id, user.role);
  }
}
