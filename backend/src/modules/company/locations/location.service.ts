import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EmployeeRole } from '@prisma/client';
import { PrismaService } from '@/common/prisma.service';
import type { CreateLocationDto } from './location.dto';
import type { UpdateLocationDto } from './location.dto';

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Return all locations for the company.
   * Any member of the company may read the list.
   */
  async list(companyId: string) {
    return this.prisma.location.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Create a new location. OWNER or MANAGER only.
   */
  async create(userId: string, companyId: string, dto: CreateLocationDto) {
    await this.requireOwnerOrManager(userId, companyId);

    return this.prisma.location.create({
      data: {
        companyId,
        name: dto.name,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        geofenceRadiusM: dto.geofenceRadiusM ?? 150,
      },
    });
  }

  /**
   * Update a location. OWNER or MANAGER only.
   */
  async update(userId: string, companyId: string, locationId: string, dto: UpdateLocationDto) {
    await this.requireOwnerOrManager(userId, companyId);
    await this.findOrThrow(companyId, locationId);

    return this.prisma.location.update({
      where: { id: locationId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude }),
        ...(dto.geofenceRadiusM !== undefined && { geofenceRadiusM: dto.geofenceRadiusM }),
      },
    });
  }

  /**
   * Delete a location. OWNER or MANAGER only.
   */
  async remove(userId: string, companyId: string, locationId: string) {
    await this.requireOwnerOrManager(userId, companyId);
    await this.findOrThrow(companyId, locationId);

    await this.prisma.location.delete({ where: { id: locationId } });
    return { ok: true, deletedId: locationId };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private async requireOwnerOrManager(userId: string, companyId: string) {
    const membership = await this.prisma.employee.findFirst({
      where: { userId, companyId },
    });
    if (!membership) throw new NotFoundException('Company not found');
    if (membership.role !== EmployeeRole.OWNER && membership.role !== EmployeeRole.MANAGER) {
      throw new ForbiddenException('Only OWNER or MANAGER can manage locations');
    }
  }

  private async findOrThrow(companyId: string, locationId: string) {
    const loc = await this.prisma.location.findFirst({
      where: { id: locationId, companyId },
    });
    if (!loc) throw new NotFoundException('Location not found');
    return loc;
  }
}
