import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { AbsenceType } from '@prisma/client';

export class CreateAbsenceDto {
  @ApiProperty({ description: 'Employee ID', example: 'clx...' })
  @IsString()
  employeeId: string;

  @ApiProperty({ enum: AbsenceType, description: 'Absence type' })
  @IsEnum(AbsenceType)
  type: AbsenceType;

  @ApiProperty({ description: 'Start date (ISO 8601)', example: '2026-04-01' })
  @IsISO8601()
  startDate: string;

  @ApiProperty({ description: 'End date (ISO 8601)', example: '2026-04-05' })
  @IsISO8601()
  endDate: string;

  @ApiPropertyOptional({ description: 'Optional note', example: 'Annual leave' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateAbsenceDto extends PartialType(CreateAbsenceDto) {}
