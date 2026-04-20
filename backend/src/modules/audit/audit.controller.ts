import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PrismaService } from '@/common/prisma.service';

interface AuthedUser {
  id: string;
  isSuperAdmin?: boolean;
}

/**
 * AuditController
 *
 * Read-only surface for the audit log. Super-admins see the global feed;
 * company owners see their own company's feed. All other callers get 403.
 */
@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  /** Last 100 entries across the whole platform. Super-admin only. */
  @Get()
  async recent(@Req() req: Request) {
    const user = (req.user ?? null) as AuthedUser | null;
    if (!user?.id) throw new UnauthorizedException('Authentication required');
    if (!user.isSuperAdmin) {
      throw new ForbiddenException('Super-admin access required');
    }

    return this.prisma.auditEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  /** Last 100 entries for a company. OWNER of that company only. */
  @Get('company/:id')
  async forCompany(@Req() req: Request, @Param('id') companyId: string) {
    const user = (req.user ?? null) as AuthedUser | null;
    if (!user?.id) throw new UnauthorizedException('Authentication required');

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, ownerId: true },
    });
    if (!company) throw new NotFoundException('Company not found');

    if (company.ownerId !== user.id && !user.isSuperAdmin) {
      throw new ForbiddenException('Only the company OWNER can view its audit log');
    }

    return this.prisma.auditEntry.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
