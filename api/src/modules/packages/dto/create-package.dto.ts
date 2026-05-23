import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PackageType } from '@condo/shared';

export class CreatePackageDto {
  @ApiProperty()
  @IsString()
  apartmentId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  residentId?: string;

  @ApiProperty({ enum: PackageType })
  @IsEnum(PackageType)
  type: PackageType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
