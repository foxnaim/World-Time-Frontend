import { Logger, UseFilters } from '@nestjs/common';
import { Command, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { PrismaService } from '@/common/prisma.service';
import { TelegramErrorsFilter } from './errors.filter';

/**
 * /admin — Telegram bot command for managing platform super-admin access.
 *
 * Bootstrap flow (first-time setup):
 *   If no super-admins exist in the DB yet, the first user to run /admin
 *   automatically becomes one. After that, only existing super-admins can
 *   grant the role to others.
 *
 * Grant another user:
 *   Super-admin replies to any user's message with /admin grant
 *   (not implemented yet — can be added when needed).
 */
@Update()
@UseFilters(TelegramErrorsFilter)
export class AdminHandler {
  private readonly logger = new Logger(AdminHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  @Command('admin')
  async adminCommand(@Ctx() ctx: Context): Promise<void> {
    const user = (ctx.state as any).user as { id: string; isSuperAdmin: boolean } | undefined;

    if (!user) {
      await ctx.reply('Аккаунт не найден. Попробуй /start.');
      return;
    }

    // If already super-admin, show status.
    if (user.isSuperAdmin) {
      const count = await this.prisma.user.count({ where: { isSuperAdmin: true } });
      await ctx.reply(
        `У тебя есть права платформенного администратора.\n\nВсего супер-админов: ${count}.`,
      );
      return;
    }

    // Bootstrap: if no super-admins exist yet, grant the first one.
    const existingCount = await this.prisma.user.count({ where: { isSuperAdmin: true } });
    if (existingCount === 0) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isSuperAdmin: true },
      });
      this.logger.log(`Bootstrap: userId=${user.id} is now the first super-admin`);
      await ctx.reply(
        'Ты стал первым платформенным администратором.\n\n' +
          'Теперь у тебя есть доступ к /admin панели на сайте.',
      );
      return;
    }

    // Already have super-admins, access denied.
    await ctx.reply(
      'Нет доступа. Права администратора выдаёт действующий супер-админ платформы.',
    );
  }
}
