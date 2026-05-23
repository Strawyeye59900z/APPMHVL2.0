import {
  Controller, Get, Post, Patch, Param, Body, UseGuards, Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { UserRole } from '@condo/shared';

@ApiTags('packages')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('packages')
export class PackagesController {
  constructor(private service: PackagesService) {}

  @Post()
  @Roles(UserRole.GATE, UserRole.ADMIN)
  create(@Body() dto: CreatePackageDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.service.create(dto, user.id);
  }

  @Get('pending')
  @Roles(UserRole.ADMIN, UserRole.GATE)
  findAllPending() {
    return this.service.findAllPending();
  }

  @Get('pending/my')
  @Roles(UserRole.RESIDENT)
  findMyPending(@Req() req: Request) {
    const user = (req as any).user;
    return this.service.findPendingByApartment(user.apartmentId);
  }

  @Get('history/my')
  @Roles(UserRole.RESIDENT)
  findMyHistory(@Req() req: Request) {
    const user = (req as any).user;
    return this.service.findHistory(user.apartmentId);
  }

  @Patch(':id/pickup')
  @Roles(UserRole.RESIDENT)
  pickup(@Param('id') id: string, @Req() req: Request, @Body('residentId') residentId: string) {
    const user = (req as any).user;
    return this.service.pickup(id, residentId, user.apartmentId);
  }
}
