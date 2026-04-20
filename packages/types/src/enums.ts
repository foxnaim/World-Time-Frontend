import { z } from 'zod';

/**
 * Canonical enum values — MUST match `schema.prisma` in @tact/database.
 * Source of truth is Prisma; this file mirrors it verbatim.
 */

// EmployeeStatus: ACTIVE | INACTIVE
export const EmployeeStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export const EmployeeStatusSchema = z.enum([EmployeeStatus.ACTIVE, EmployeeStatus.INACTIVE]);
export type EmployeeStatus = z.infer<typeof EmployeeStatusSchema>;

// EmployeeRole: OWNER | MANAGER | STAFF
export const EmployeeRole = {
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
} as const;
export const EmployeeRoleSchema = z.enum([
  EmployeeRole.OWNER,
  EmployeeRole.MANAGER,
  EmployeeRole.STAFF,
]);
export type EmployeeRole = z.infer<typeof EmployeeRoleSchema>;

// CheckInType: IN | OUT
export const CheckInType = {
  IN: 'IN',
  OUT: 'OUT',
} as const;
export const CheckInTypeSchema = z.enum([CheckInType.IN, CheckInType.OUT]);
export type CheckInType = z.infer<typeof CheckInTypeSchema>;

// ProjectStatus: ACTIVE | DONE | ARCHIVED
export const ProjectStatus = {
  ACTIVE: 'ACTIVE',
  DONE: 'DONE',
  ARCHIVED: 'ARCHIVED',
} as const;
export const ProjectStatusSchema = z.enum([
  ProjectStatus.ACTIVE,
  ProjectStatus.DONE,
  ProjectStatus.ARCHIVED,
]);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;
