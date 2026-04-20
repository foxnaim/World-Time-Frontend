import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/common/prisma.service';

export interface AuditRecordInput {
  actorUserId?: string | null;
  companyId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Prisma.InputJsonValue;
}

/**
 * AuditService
 *
 * Fire-and-forget writer for the AuditEntry table. Callers MUST NOT rely on
 * this method to throw — failures are logged and swallowed so a failed audit
 * write never cascades into a failed business operation. If you need a
 * hard-fail audit trail, roll your own with PrismaService directly.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(input: AuditRecordInput): Promise<void> {
    try {
      await this.prisma.auditEntry.create({
        data: {
          actorUserId: input.actorUserId ?? null,
          companyId: input.companyId ?? null,
          action: input.action,
          targetType: input.targetType,
          targetId: input.targetId ?? null,
          metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      this.logger.warn(
        `audit write failed action=${input.action} target=${input.targetType}:${
          input.targetId ?? '-'
        } err=${(err as Error).message ?? err}`,
      );
    }
  }
}
