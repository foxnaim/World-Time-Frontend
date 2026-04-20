import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
  DefaultValuePipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { SuperAdminGuard } from './guards/super-admin.guard';

/**
 * Platform super-admin REST surface. Most routes require SuperAdminGuard;
 * `whoami` is a lightweight auth-only probe so the frontend can decide
 * whether to surface the "Admin" navigation affordance without taking a
 * 403 on every page load.
 */
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  /**
   * Auth-only (JWT) probe: returns isSuperAdmin from the JWT user object
   * (populated by JwtStrategy from DB). Safe to call from the dashboard shell
   * for any authenticated user — never returns 403.
   */
  @UseGuards(JwtAuthGuard)
  @Get('whoami')
  whoami(@Req() req: Request): { isSuperAdmin: boolean } {
    const user = (req.user ?? null) as { id?: string; isSuperAdmin?: boolean } | null;
    return { isSuperAdmin: user?.isSuperAdmin === true };
  }

  /** Global platform counters. */
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('stats')
  stats() {
    return this.admin.stats();
  }

  /** Paginated company listing with optional name/slug search. */
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('companies')
  listCompanies(
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
    @Query('cursor') cursor?: string,
    @Query('q') q?: string,
  ) {
    return this.admin.listCompanies({ limit, cursor, q });
  }

  /** Full details for a single company. */
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('companies/:id')
  companyDetails(@Param('id') id: string) {
    return this.admin.companyDetails(id);
  }

  /** Soft-deactivate every employee of a company — effectively disables it. */
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Throttle({ default: { limit: 3, ttl: 3600_000 } })
  @Post('companies/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  deactivateCompany(@Param('id') id: string) {
    return this.admin.deactivateCompany(id);
  }

  /** Look up a user by telegramId or phone fragment. */
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('users')
  listUsers(@Query('telegramId') telegramId?: string, @Query('phone') phone?: string) {
    return this.admin.listUsers({ telegramId, phone });
  }
}
