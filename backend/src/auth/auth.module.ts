import { Module } from '@nestjs/common';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { SupabaseAuthService } from './supabase-auth.service';
import { RolesGuard } from './roles.guard';

@Module({
  providers: [SupabaseAuthService, SupabaseAuthGuard, RolesGuard],
  exports: [SupabaseAuthService, SupabaseAuthGuard, RolesGuard],
})
export class AuthModule {}
