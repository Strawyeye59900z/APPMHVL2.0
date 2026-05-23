import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const SKIP_MCP_KEY = 'skipMustChangePassword';
export const SkipMustChangePassword = () =>
  Reflect.metadata(SKIP_MCP_KEY, true);

@Injectable()
export class MustChangePasswordGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_MCP_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const { user } = context.switchToHttp().getRequest();
    if (user?.mustChangePassword) {
      throw new ForbiddenException('Você precisa alterar sua senha antes de continuar.');
    }
    return true;
  }
}
