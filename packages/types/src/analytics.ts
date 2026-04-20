import { z } from 'zod';

export const CompanyLateStatsSchema = z.object({
  employeeId: z.string().uuid(),
  name: z.string(),
  lateCount: z.number().int().nonnegative(),
  avgLateMinutes: z.number().nonnegative(),
  totalLateMinutes: z.number().nonnegative(),
});
export type CompanyLateStats = z.infer<typeof CompanyLateStatsSchema>;

export const CompanyRankingSchema = z.object({
  rank: z.number().int().positive(),
  employeeId: z.string().uuid(),
  name: z.string(),
  punctualityScore: z.number().min(0).max(100),
});
export type CompanyRanking = z.infer<typeof CompanyRankingSchema>;

export const OvertimeReportSchema = z.object({
  employeeId: z.string().uuid(),
  name: z.string(),
  overtimeHours: z.number().nonnegative(),
});
export type OvertimeReport = z.infer<typeof OvertimeReportSchema>;

/**
 * Real hourly rate derived from tracked time vs. total income for a user in
 * the window `[periodStart, periodEnd]`.
 */
export const UserRealHourlyRateSchema = z.object({
  userId: z.string().uuid(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  totalSeconds: z.number().int().nonnegative(),
  totalIncome: z.number().nonnegative(),
  effectiveRate: z.number().nonnegative(),
});
export type UserRealHourlyRate = z.infer<typeof UserRealHourlyRateSchema>;
