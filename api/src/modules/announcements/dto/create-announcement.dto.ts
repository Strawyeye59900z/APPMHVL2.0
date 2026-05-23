import { IsString, IsBoolean, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  body: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  sendToWhatsapp?: boolean;
}
