import { Global, Module } from '@nestjs/common';

import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

/**
 * AuditModule
 *
 * @Global() so AuditService can be injected anywhere without juggling module
 * imports — the audit log is a cross-cutting concern. PrismaModule is already
 * @Global() in the app so PrismaService is picked up implicitly.
 */
@Global()
@Module({
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
