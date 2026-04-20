import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

interface AuthedRequest {
  user?: { id: string; isSuperAdmin?: boolean } | null;
}

/**
 * Gate-keeper for the platform super-admin console.
 * Reads isSuperAdmin from req.user, which JwtStrategy populates via a DB
 * lookup on every authenticated request.
 *
 * Super-admin status is managed through the Telegram bot (/admin command)
 * and stored in User.isSuperAdmin — no env var required.
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const user = req.user;
    if (!user?.id) {
      throw new UnauthorizedException('Authentication required');
    }
    if (!user.isSuperAdmin) {
      throw new ForbiddenException('Super-admin access required');
    }
    return true;
  }
}
