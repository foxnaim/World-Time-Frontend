import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShiftDto {
  @ApiProperty({ description: 'Shift name', example: 'Morning' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ description: 'Shift start hour (0–23)', example: 9 })
  @IsInt()
  @Min(0)
  @Max(23)
  startHour!: number;

  @ApiProperty({ description: 'Shift end hour (0–23)', example: 18 })
  @IsInt()
  @Min(0)
  @Max(23)
  endHour!: number;
}

export class UpdateShiftDto {
  @ApiPropertyOptional({ description: 'New shift name', example: 'Day' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'New start hour (0–23)', example: 8 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  startHour?: number;

  @ApiPropertyOptional({ description: 'New end hour (0–23)', example: 17 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  endHour?: number;
}
