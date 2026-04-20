import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmployeeRole } from '@prisma/client';
import { PrismaService } from '@/common/prisma.service';
import type { CreateDepartmentDto } from './department.dto';
import type { UpdateDepartmentDto } from './department.dto';

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all departments for a company, annotated with the number of employees
   * currently assigned to each one.
   */
  async list(companyId: string) {
    const departments = await this.prisma.department.findMany({
      where: { companyId },
      include: { _count: { select: { employees: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return departments.map((d) => ({
      id: d.id,
      name: d.name,
      employeeCount: d._count.employees,
      createdAt: d.createdAt,
    }));
  }

  /**
   * Create a new department. Caller must be OWNER or MANAGER.
   */
  async create(userId: string, companyId: string, dto: CreateDepartmentDto) {
    await this.assertOwnerOrManager(userId, companyId);

    return this.prisma.department.create({
      data: { name: dto.name, companyId },
      select: { id: true, name: true, companyId: true, createdAt: true },
    });
  }

  /**
   * Update department name. Caller must be OWNER or MANAGER.
   */
  async update(userId: string, companyId: string, id: string, dto: UpdateDepartmentDto) {
    await this.assertOwnerOrManager(userId, companyId);
    await this.findOrThrow(id, companyId);

    return this.prisma.department.update({
      where: { id },
      data: { ...(dto.name !== undefined && { name: dto.name }) },
      select: { id: true, name: true, companyId: true, createdAt: true },
    });
  }

  /**
   * Delete a department and nullify the departmentId on all assigned employees
   * (handled automatically by the nullable FK — Prisma sets to null when the
   * department row is deleted because of the onDelete behaviour; we also do it
   * explicitly in a transaction to be safe).
   */
  async remove(userId: string, companyId: string, id: string) {
    await this.assertOwnerOrManager(userId, companyId);
    await this.findOrThrow(id, companyId);

    await this.prisma.$transaction(async (tx) => {
      // Clear department assignment from employees before deleting.
      await tx.employee.updateMany({
        where: { companyId, departmentId: id },
        data: { departmentId: null },
      });
      await tx.department.delete({ where: { id } });
    });

    return { ok: true, deletedId: id };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private async assertOwnerOrManager(userId: string, companyId: string) {
    const membership = await this.prisma.employee.findFirst({
      where: { userId, companyId },
    });
    if (!membership) {
      throw new NotFoundException('Company not found or you are not a member');
    }
    if (membership.role !== EmployeeRole.OWNER && membership.role !== EmployeeRole.MANAGER) {
      throw new ForbiddenException('Only OWNER or MANAGER can manage departments');
    }
  }

  private async findOrThrow(id: string, companyId: string) {
    const dept = await this.prisma.department.findFirst({ where: { id, companyId } });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }
}
