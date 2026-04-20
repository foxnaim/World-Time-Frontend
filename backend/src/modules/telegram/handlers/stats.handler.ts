import { UseFilters } from '@nestjs/common';
import { Command, Ctx, Hears, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { CheckInType } from '@prisma/client';
import { PrismaService } from '@/common/prisma.service';
import { TelegramErrorsFilter } from './errors.filter';

function startOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function fmtHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}ч ${m}м`;
}

@Update()
@UseFilters(TelegramErrorsFilter)
export class StatsHandler {
  constructor(private readonly prisma: PrismaService) {}

  @Command('stats')
  async statsCmd(@Ctx() ctx: Context): Promise<void> {
    await this.render(ctx);
  }

  @Hears(/^(Статистика|Stats)$/i)
  async statsHears(@Ctx() ctx: Context): Promise<void> {
    await this.render(ctx);
  }

  private async render(ctx: Context): Promise<void> {
    const user = (ctx.state as any).user;
    if (!user) {
      await ctx.reply('Сначала выполни /start.');
      return;
    }

    const monthStart = startOfMonth();
    const lines: string[] = [];

    const employee = await this.prisma.employee
      .findFirst({
        where: { userId: user.id, status: 'ACTIVE' },
        include: { company: { select: { name: true } } },
      })
      .catch(() => null);

    if (employee) {
      const entries = await this.prisma.timeEntry.findMany({
        where: {
          project: { userId: user.id },
          startedAt: { gte: monthStart },
          endedAt: { not: null },
        },
        select: { durationSec: true },
      });
      const totalMinutes = Math.floor(
        entries.reduce((acc, e) => acc + (e.durationSec ?? 0), 0) / 60,
      );

      const workStartHour = employee.company
        ? (await this.prisma.company.findUnique({
            where: { id: employee.companyId },
            select: { workStartHour: true },
          }))?.workStartHour ?? 9
        : 9;

      const inCheckins = await this.prisma.checkIn.findMany({
        where: { employeeId: employee.id, type: CheckInType.IN, timestamp: { gte: monthStart } },
        select: { timestamp: true },
      });
      const MSK_OFFSET_MS = 3 * 60 * 60 * 1000;
      const lateCount = inCheckins.filter((c) => {
        const msk = new Date(c.timestamp.getTime() + MSK_OFFSET_MS);
        return msk.getUTCHours() * 60 + msk.getUTCMinutes() > workStartHour * 60;
      }).length;

      lines.push(`Компания: ${employee.company?.name ?? '—'}`);
      lines.push(`Часы за месяц: ${fmtHours(totalMinutes)}`);
      lines.push(`Опозданий: ${lateCount}`);
    } else {
      const active = await this.prisma.project.count({
        where: {
          userId: user.id,
          status: { not: 'ARCHIVED' },
        },
      });

      const grouped = await this.prisma.timeEntry
        .groupBy({
          by: ['projectId'],
          where: {
            project: { userId: user.id },
            startedAt: { gte: monthStart },
            endedAt: { not: null },
          },
          _sum: { durationSec: true },
        })
        .catch(() => [] as Array<{ projectId: string; _sum: { durationSec: number | null } }>);

      const totalMinutes = Math.floor(
        (Array.isArray(grouped) ? grouped : []).reduce(
          (acc: number, r: any) => acc + (r._sum?.durationSec ?? 0),
          0,
        ) / 60,
      );

      lines.push(`Активных проектов: ${active}`);
      lines.push(`Часы за месяц: ${fmtHours(totalMinutes)}`);

      if (Array.isArray(grouped) && grouped.length) {
        const projectIds = grouped.map((g: any) => g.projectId);
        const projects = await this.prisma.project.findMany({
          where: { id: { in: projectIds } },
          select: { id: true, name: true, hourlyRate: true, fixedPrice: true },
        });
        const nameMap = new Map(projects.map((p) => [p.id, p]));
        lines.push('');
        lines.push('Реальная ставка по проектам:');
        for (const row of grouped as any[]) {
          const p = nameMap.get(row.projectId);
          if (!p) continue;
          const minutes = Math.floor((row._sum?.durationSec ?? 0) / 60);
          if (minutes <= 0) continue;
          const hours = minutes / 60;
          let rate: number | null = null;
          if (p.fixedPrice && Number(p.fixedPrice) > 0) {
            rate = Number(p.fixedPrice) / hours;
          } else if (p.hourlyRate && Number(p.hourlyRate) > 0) {
            rate = Number(p.hourlyRate);
          }
          const rateStr = rate !== null ? `${rate.toFixed(0)}/ч` : '—';
          lines.push(`• ${p.name}: ${fmtHours(minutes)} — ${rateStr}`);
        }
      }
    }

    await ctx.reply(lines.join('\n') || 'Данных пока нет.');
  }
}
