import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { UserRole } from '@condo/shared';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('reservations/pdf')
  @Roles(UserRole.ADMIN)
  async reservationsPdf(
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    const pdf = await this.service.generateReservationsPdf(from, to);
    const filename = `reservas_${from}_${to}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdf);
  }
}
