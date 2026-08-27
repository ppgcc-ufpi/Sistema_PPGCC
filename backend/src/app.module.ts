import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CorrectionsModule } from './corrections/corrections.module';
import { AuthModule } from './auth/auth.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { FacultyModule } from './faculty/faculty.module';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { PublicDataModule } from './public/public-data.module';
import { RecordsModule } from './records/records.module';
import { SuggestionsModule } from './suggestions/suggestions.module';
import { VisibilityModule } from './visibility/visibility.module';
import { UsersModule } from './users/users.module';
import { validateEnvironment } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    CorrectionsModule,
    AuthModule,
    FacultyModule,
    DashboardsModule,
    PublicDataModule,
    RecordsModule,
    SuggestionsModule,
    VisibilityModule,
    UsersModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
