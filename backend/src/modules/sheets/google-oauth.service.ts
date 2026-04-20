import { Injectable, Logger, NotImplementedException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';

import * as oauthStore from './storage/google-oauth-store';

/**
 * Per-user OAuth for Google Sheets/Drive.
 *
 * We reuse a single OAuth 2.0 Client (configured in Google Cloud Console)
 * across all users: each user goes through the consent flow individually
 * and we persist their refresh_token so later we can act on their behalf
 * without re-prompting.
 *
 * The service account path in SheetsService remains as a fallback for
 * use-cases that don't need user-Drive ownership (or for CI).
 */

const OAUTH_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

@Injectable()
export class GoogleOAuthService {
  private readonly logger = new Logger(GoogleOAuthService.name);

  constructor(private readonly config: ConfigService) {}

  private getClientConfig(): { clientId: string; clientSecret: string; redirectUri: string } {
    const clientId = this.config.get<string>('GOOGLE_OAUTH_CLIENT_ID');
    const clientSecret = this.config.get<string>('GOOGLE_OAUTH_CLIENT_SECRET');
    const redirectUri = this.config.get<string>('GOOGLE_OAUTH_REDIRECT_URI');
    if (!clientId || !clientSecret || !redirectUri) {
      throw new NotImplementedException(
        'Google OAuth не настроен. Задайте GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT_URI.',
      );
    }
    return { clientId, clientSecret, redirectUri };
  }

  private buildClient(): OAuth2Client {
    const { clientId, clientSecret, redirectUri } = this.getClientConfig();
    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  }

  /**
   * Build the Google consent URL for a user. We embed the user's id in
   * the state so the callback knows which user to persist tokens for.
   */
  buildAuthUrl(userId: string): string {
    const client = this.buildClient();
    return client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: OAUTH_SCOPES,
      state: userId,
      include_granted_scopes: true,
    });
  }

  /**
   * Exchange an auth code for tokens and persist them for the given user.
   */
  async exchangeCode(userId: string, code: string): Promise<void> {
    const client = this.buildClient();
    const { tokens } = await client.getToken(code);
    if (!tokens.refresh_token) {
      // Google only sends refresh_token on the first consent — to force
      // it again the user must revoke access in their Google account.
      const existing = await oauthStore.get(userId);
      if (!existing?.refreshToken) {
        throw new UnauthorizedException(
          'Google не вернул refresh_token. Отзовите доступ на https://myaccount.google.com/permissions и попробуйте ещё раз.',
        );
      }
    }

    let email: string | null = null;
    if (tokens.id_token) {
      try {
        const payload = JSON.parse(
          Buffer.from(tokens.id_token.split('.')[1], 'base64').toString('utf-8'),
        ) as { email?: string };
        email = payload.email ?? null;
      } catch {
        // non-fatal; email lookup is best-effort
      }
    }

    const existing = await oauthStore.get(userId);
    await oauthStore.set(userId, {
      refreshToken: tokens.refresh_token ?? existing?.refreshToken ?? '',
      accessToken: tokens.access_token ?? null,
      expiryDate: tokens.expiry_date ?? null,
      email: email ?? existing?.email ?? null,
      scope: tokens.scope ?? existing?.scope ?? null,
      connectedAt: new Date().toISOString(),
    });
    this.logger.log(`Google OAuth connected for user=${userId} email=${email ?? 'unknown'}`);
  }

  /**
   * Return an OAuth2 client with credentials loaded, refreshing the
   * access token as needed. Throws NotImplementedException if the user
   * hasn't connected Google yet.
   */
  async getAuthorizedClient(userId: string): Promise<OAuth2Client> {
    const saved = await oauthStore.get(userId);
    if (!saved || !saved.refreshToken) {
      throw new NotImplementedException('Пользователь не подключил Google-аккаунт.');
    }
    const client = this.buildClient();
    client.setCredentials({
      refresh_token: saved.refreshToken,
      access_token: saved.accessToken ?? undefined,
      expiry_date: saved.expiryDate ?? undefined,
    });

    // Persist rotated tokens when the library refreshes them.
    client.on('tokens', async (tok) => {
      await oauthStore.set(userId, {
        refreshToken: tok.refresh_token ?? saved.refreshToken,
        accessToken: tok.access_token ?? null,
        expiryDate: tok.expiry_date ?? null,
        email: saved.email,
        scope: tok.scope ?? saved.scope,
        connectedAt: saved.connectedAt,
      });
    });

    return client;
  }

  async getConnection(userId: string): Promise<{ connected: boolean; email: string | null }> {
    const saved = await oauthStore.get(userId);
    return {
      connected: Boolean(saved?.refreshToken),
      email: saved?.email ?? null,
    };
  }

  async disconnect(userId: string): Promise<void> {
    await oauthStore.remove(userId);
  }
}
