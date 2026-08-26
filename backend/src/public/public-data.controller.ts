import { Controller, Get, Query } from '@nestjs/common';
import { PublicDataService } from './public-data.service';

@Controller('public')
export class PublicDataController {
  constructor(private readonly publicData: PublicDataService) {}

  @Get('dashboard')
  dashboard(@Query('program') program?: string) {
    return this.publicData.dashboard(program);
  }

  @Get('faculty')
  faculty(@Query('program') program?: string) {
    return this.publicData.faculty(program);
  }

  @Get('productions')
  productions(@Query('program') program?: string) {
    return this.publicData.productions(program);
  }

  @Get('advising')
  advising(@Query('program') program?: string) {
    return this.publicData.advising(program);
  }

  @Get('projects')
  projects(@Query('program') program?: string) {
    return this.publicData.projects(program);
  }

  @Get('education')
  education(@Query('program') program?: string) {
    return this.publicData.education(program);
  }
}
