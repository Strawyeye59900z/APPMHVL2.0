import { IsEnum, IsString, MinLength } from 'class-validator';
import { UserRole } from '@condo/shared';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@condominio.com' })
  @IsString()
  identifier: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;
}
