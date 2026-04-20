import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Department name', example: 'Engineering' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;
}

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ description: 'New department name', example: 'Product Engineering' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;
}
