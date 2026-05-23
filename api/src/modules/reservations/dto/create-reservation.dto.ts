import { IsEnum, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SpaceType } from '@condo/shared';

export class CreateReservationDto {
  @ApiProperty({ enum: SpaceType })
  @IsEnum(SpaceType)
  spaceType: SpaceType;

  @ApiProperty()
  @IsString()
  residentId: string;

  @ApiProperty({ description: 'ISO datetime string' })
  @IsDateString()
  startsAt: string;

  @ApiProperty({ description: 'ISO datetime string' })
  @IsDateString()
  endsAt: string;
}
