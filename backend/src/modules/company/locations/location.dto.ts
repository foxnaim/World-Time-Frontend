import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({ description: 'Location name', example: 'Main Office' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Street address', example: 'Almaty, Dostyk 5' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Latitude', example: 43.238949 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ description: 'Longitude', example: 76.889709 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({ description: 'Geofence radius in metres', example: 150 })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(2000)
  geofenceRadiusM?: number;
}

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}
