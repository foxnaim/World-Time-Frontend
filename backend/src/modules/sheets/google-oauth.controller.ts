import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Logger,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { Public } from '@/common/decorators/public.decorator';
import { GoogleOAuthService } from './google-oauth.service';

type JwtUser = { id: string };

/**
 * OAuth flow endpoints.
 *
 * /start (JWT-guarded) → returns the Google consent URL the frontend
 *   redirects the browser to.
 * /callback (public — state carries the userId) → Google redirects here
 *   with the auth code. We exchange it, persist tokens, then redirect the
 *   browser back to the app's profile page.
 * /status, /disconnect — JWT-guarded accessors.
 */
@ApiTags('google-oauth')
@Controller('auth/google')
export class GoogleOAuthController {
  private readonly logger = new Logger(GoogleOAuthController.name);

  constructor(
    private readonly oauth: GoogleOAuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('start')
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Return Google OAuth consent URL' })
  async start(@Req() req: Request) {
    const user = req.user as JwtUser;
    const url = this.oauth.buildAuthUrl(user.id);
    return { url };
  }

  @Get('callback')
  @Public()
  @ApiOperation({ summary: 'Google OAuth redirect target' })
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ) {
    const appUrl = this.config.get<string>('APP_URL') ?? 'http://localhost:3000';
    if (error) {
      return res.redirect(`${appUrl}/profile?google_error=${encodeURIComponent(error)}`);
    }
    if (!code || !state) {
      throw new BadRequestException('Missing code/state');
    }
    try {
      await this.oauth.exchangeCode(state, code);
      return res.redirect(`${appUrl}/profile?google_connected=1`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'oauth_failed';
      return res.redirect(`${appUrl}/profile?google_error=${encodeURIComponent(msg)}`);
    }
  }

  @Get('status')
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Current user Google OAuth connection status' })
  async status(@Req() req: Request) {
    const user = req.user as JwtUser;
    return this.oauth.getConnection(user.id);
  }

  @Delete('disconnect')
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Disconnect the current user Google account' })
  async disconnect(@Req() req: Request) {
    const user = req.user as JwtUser;
    await this.oauth.disconnect(user.id);
    return { ok: true };
  }
}
