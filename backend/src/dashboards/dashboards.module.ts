import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DashboardsController } from './dashboards.controller';
import { DashboardsService } from './dashboards.service';

@Module({
  imports: [AuthModule],
  controllers: [DashboardsController],
  providers: [DashboardsService],
})
export class DashboardsModule {}
