import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestAutenticada } from './supabase-auth.guard';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest<RequestAutenticada>().usuario,
);
