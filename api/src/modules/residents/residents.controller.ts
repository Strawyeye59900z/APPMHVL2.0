import {
  Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { ResidentsService } from './residents.service';
import { CreateResidentDto } from './dto/create-resident.dto';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { UserRole } from '@condo/shared';

@ApiTags('residents')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('apartments/:apartmentId/residents')
export class ResidentsController {
  constructor(private service: ResidentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RESIDENT)
  create(
    @Param('apartmentId') apartmentId: string,
    @Body() dto: CreateResidentDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    if (user.role === UserRole.RESIDENT && user.apartmentId !== apartmentId) {
      throw new Error('Sem permissão');
    }
    return this.service.create(apartmentId, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.GATE, UserRole.RESIDENT)
  findAll(@Param('apartmentId') apartmentId: string) {
    return this.service.findByApartment(apartmentId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.RESIDENT)
  update(
    @Param('id') id: string,
    @Body() dto: CreateResidentDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.service.update(id, dto, user.id, user.role);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.RESIDENT)
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }
}
