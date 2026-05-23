import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApartmentDto {
  @ApiProperty({ example: '101' })
  @IsString()
  number: string;

  @ApiProperty({ example: 'A', required: false })
  @IsOptional()
  @IsString()
  block?: string;

  @ApiProperty({ description: 'Senha inicial do apartamento', minLength: 6 })
  @IsString()
  @MinLength(6)
  defaultPassword: string;
}
