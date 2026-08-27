import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';

@Module({
  imports: [AuthModule],
  controllers: [RecordsController],
  providers: [RecordsService],
})
export class RecordsModule {}
