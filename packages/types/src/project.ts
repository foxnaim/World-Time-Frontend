import { z } from 'zod';
import { ProjectStatusSchema } from './enums.js';

const CurrencySchema = z
  .string()
  .length(3)
  .regex(/^[A-Z]{3}$/, 'ISO-4217 currency expected')
  .default('RUB');

export const CreateProjectDtoSchema = z
  .object({
    name: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    hourlyRate: z.number().nonnegative().optional(),
    fixedPrice: z.number().nonnegative().optional(),
    currency: CurrencySchema,
  })
  .refine((d) => !(d.hourlyRate !== undefined && d.fixedPrice !== undefined), {
    message: 'specify either hourlyRate or fixedPrice, not both',
    path: ['hourlyRate'],
  });
export type CreateProjectDto = z.infer<typeof CreateProjectDtoSchema>;

export const UpdateProjectDtoSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    hourlyRate: z.number().nonnegative().optional(),
    fixedPrice: z.number().nonnegative().optional(),
    currency: z
      .string()
      .length(3)
      .regex(/^[A-Z]{3}$/)
      .optional(),
    status: ProjectStatusSchema.optional(),
  })
  .partial();
export type UpdateProjectDto = z.infer<typeof UpdateProjectDtoSchema>;

export const StartTimerDtoSchema = z.object({
  projectId: z.string().uuid(),
});
export type StartTimerDto = z.infer<typeof StartTimerDtoSchema>;

export const StopTimerDtoSchema = z.object({
  entryId: z.string().uuid(),
});
export type StopTimerDto = z.infer<typeof StopTimerDtoSchema>;

export const TimeEntryResponseSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  startedAt: z.string().datetime(),
  stoppedAt: z.string().datetime().nullable().optional(),
  durationSec: z.number().int().nonnegative().nullable().optional(),
  note: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
});
export type TimeEntryResponse = z.infer<typeof TimeEntryResponseSchema>;

/**
 * Per-project monthly rollup. `realHourlyRate` = totalIncome / (totalSeconds/3600)
 * and may differ from `declaredRate` — `insight` is a short human-readable
 * explanation rendered in the dashboard.
 */
export const ProjectMonthlySummarySchema = z.object({
  projectId: z.string().uuid(),
  totalSeconds: z.number().int().nonnegative(),
  declaredRate: z.number().nonnegative().nullable().optional(),
  realHourlyRate: z.number().nonnegative().nullable().optional(),
  insight: z.string(),
});
export type ProjectMonthlySummary = z.infer<typeof ProjectMonthlySummarySchema>;
