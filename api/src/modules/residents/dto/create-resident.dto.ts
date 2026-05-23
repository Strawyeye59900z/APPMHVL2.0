import { IsString, IsOptional, IsBoolean, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResidentDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isOwner?: boolean;
}
