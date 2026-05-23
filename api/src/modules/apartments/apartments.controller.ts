import {
  Controller, Get, Post, Delete, Param, Body, UseGuards, Patch, Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { ApartmentsService } from './apartments.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { UserRole } from '@condo/shared';

@ApiTags('apartments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('apartments')
export class ApartmentsController {
  constructor(private service: ApartmentsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateApartmentDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.service.findAll();
  }

  @Get('my/residents')
  @Roles(UserRole.RESIDENT)
  getMyResidents(@Req() req: Request) {
    const apartmentId = (req.user as any).apartmentId;
    return this.service.getResidents(apartmentId);
  }

  @Get(':number')
  @Roles(UserRole.ADMIN, UserRole.GATE)
  findOne(@Param('number') number: string) {
    return this.service.findOne(number);
  }

  @Patch(':number/reset-password')
  @Roles(UserRole.ADMIN)
  resetPassword(@Param('number') number: string, @Body('password') password: string) {
    return this.service.resetPassword(number, password);
  }

  @Delete(':number')
  @Roles(UserRole.ADMIN)
  remove(@Param('number') number: string) {
    return this.service.remove(number);
  }
}
