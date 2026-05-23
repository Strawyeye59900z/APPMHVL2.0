import {
  Controller, Post, Get, Patch, Param, UseGuards,
  UseInterceptors, UploadedFile, Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { memoryStorage } from 'multer';
import { FacialService } from './facial.service';
import { DriveService } from '../../infra/drive/drive.service';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { UserRole } from '@condo/shared';

@ApiTags('facial')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('facial')
export class FacialController {
  constructor(
    private service: FacialService,
    private drive: DriveService,
  ) {}

  @Post('residents/:id/photo')
  @Roles(UserRole.RESIDENT, UserRole.ADMIN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo', { storage: memoryStorage() }))
  uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadPhoto(id, file);
  }

  @Get('queue/next')
  @Roles(UserRole.ADMIN)
  getNext() {
    return this.service.getQueueNext();
  }

  @Patch('residents/:id/registered')
  @Roles(UserRole.ADMIN)
  markRegistered(@Param('id') id: string) {
    return this.service.markRegistered(id);
  }

  @Get('residents/:id/photo/download')
  @Roles(UserRole.ADMIN)
  async downloadPhoto(@Param('id') id: string, @Res() res: Response) {
    const { driveId, residentName, apartmentId } = await this.service.getPhotoStream(id);
    const { stream, name } = await this.drive.getFileStream(driveId);
    const safeName = `AP${apartmentId}_${residentName.replace(/\s+/g, '_')}.jpg`;
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.setHeader('Content-Type', 'image/jpeg');
    (stream as any).pipe(res);
  }
}
