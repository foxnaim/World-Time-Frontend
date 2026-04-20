import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AbsenceType, EmployeeRole } from '@prisma/client';
import { PrismaService } from '@/common/prisma.service';
import { BotService } from '@/modules/telegram/bot.service';
import type { CreateAbsenceDto } from './absence.dto';

const ABSENCE_MESSAGES: Record<AbsenceType, (name: string, start: string, end: string) => string> = {
  VACATION: (n, s, e) => `🏖 Приятного отдыха, ${n}! Отпуск утверждён: ${s} – ${e}.`,
  SICK_LEAVE: (n, s, e) => `🤒 Выздоравливайте, ${n}! Больничный утверждён: ${s} – ${e}.`,
  DAY_OFF: (n, s, e) => `😌 Хорошего отдыха, ${n}! Выходной утверждён: ${s === e ? s : `${s} – ${e}`}.`,
  BUSINESS_TRIP: (n, s, e) => `✈️ Удачной командировки, ${n}! ${s} – ${e}.`,
};

function fmtDate(iso: string | Date): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

@Injectable()
export class AbsenceService {
  private readonly logger = new Logger(AbsenceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bot: BotService,
  ) {}

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
      include: { user: { select: { telegramId: true, firstName: true } } },
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

    // Fire-and-forget Telegram notification to the employee
    const name = employee.user.firstName;
    const msg = ABSENCE_MESSAGES[dto.type](name, fmtDate(dto.startDate), fmtDate(dto.endDate));
    this.bot.notifyUser(employee.user.telegramId, msg).catch((e) =>
      this.logger.warn(`absence notify failed: ${(e as Error).message}`),
    );

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
