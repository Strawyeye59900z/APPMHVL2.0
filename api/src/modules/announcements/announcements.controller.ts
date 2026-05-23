import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { UserRole } from '@condo/shared';

@ApiTags('announcements')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private service: AnnouncementsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateAnnouncementDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.service.create(dto, user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.service.findAll();
  }

  @Get('feed')
  @Roles(UserRole.RESIDENT, UserRole.GATE)
  findFeed() {
    return this.service.findRecent();
  }
}
