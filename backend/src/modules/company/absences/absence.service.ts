import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmployeeRole } from '@prisma/client';
import { PrismaService } from '@/common/prisma.service';
import type { CreateAbsenceDto } from './absence.dto';

@Injectable()
export class AbsenceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all absences for a company, optionally filtered to a calendar month.
   *
   * @param companyId  The company whose absences to list.
   * @param month      Optional "YYYY-MM" string; when provided, only absences
   *                   that overlap the calendar month are returned.
   */
  async list(companyId: string, month?: string) {
    // Build an optional date-range filter that catches any absence whose
    // [startDate, endDate] interval overlaps the requested month.
    let dateFilter: { startDate?: object; endDate?: object } = {};

    if (month) {
      const [y, m] = month.split('-').map(Number);
      const monthStart = new Date(y, m - 1, 1);
      const monthEnd = new Date(y, m, 1); // exclusive

      // Overlap condition: absence.startDate < monthEnd AND absence.endDate >= monthStart
      dateFilter = {
        startDate: { lt: monthEnd },
        endDate: { gte: monthStart },
      };
    }

    const absences = await this.prisma.absence.findMany({
      where: {
        employee: { companyId },
        ...dateFilter,
      },
      include: {
        employee: {
          include: {
            user: {
              select: { firstName: true, lastName: true, username: true },
            },
          },
        },
      },
      orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
    });

    return absences.map((a) => ({
      id: a.id,
      employeeId: a.employeeId,
      employeeName: [a.employee.user.firstName, a.employee.user.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || a.employee.user.username || a.employeeId,
      type: a.type,
      startDate: a.startDate.toISOString(),
      endDate: a.endDate.toISOString(),
      note: a.note ?? null,
      approvedById: a.approvedById ?? null,
      createdAt: a.createdAt.toISOString(),
    }));
  }

  /**
   * Create a new absence record.
   * Only OWNER or MANAGER employees of the company may call this.
   */
  async create(userId: string, companyId: string, dto: CreateAbsenceDto) {
    await this.requireOwnerOrManager(userId, companyId);

    // Verify the target employee belongs to this company.
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, companyId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found in this company');
    }

    const absence = await this.prisma.absence.create({
      data: {
        employeeId: dto.employeeId,
        type: dto.type,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        note: dto.note ?? null,
        approvedById: userId,
      },
    });

    return { id: absence.id, ...dto, createdAt: absence.createdAt.toISOString() };
  }

  /**
   * Delete an absence by ID.
   * Only OWNER or MANAGER employees of the company may call this.
   */
  async remove(userId: string, companyId: string, id: string) {
    await this.requireOwnerOrManager(userId, companyId);

    const absence = await this.prisma.absence.findFirst({
      where: { id, employee: { companyId } },
    });
    if (!absence) {
      throw new NotFoundException('Absence record not found');
    }

    await this.prisma.absence.delete({ where: { id } });
    return { ok: true };
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  private async requireOwnerOrManager(userId: string, companyId: string) {
    const emp = await this.prisma.employee.findFirst({
      where: { userId, companyId },
    });
    if (!emp) {
      throw new ForbiddenException('You are not a member of this company');
    }
    if (emp.role !== EmployeeRole.OWNER && emp.role !== EmployeeRole.MANAGER) {
      throw new ForbiddenException('OWNER or MANAGER role required');
    }
    return emp;
  }
}
