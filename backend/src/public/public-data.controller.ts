import { Controller, Get } from '@nestjs/common';
import { PublicDataService } from './public-data.service';

@Controller('public')
export class PublicDataController {
  constructor(private readonly publicData: PublicDataService) {}

  @Get('dashboard')
  dashboard() {
    return this.publicData.dashboard();
  }

  @Get('docentes')
  docentes() {
    return this.publicData.docentes();
  }

  @Get('producoes')
  producoes() {
    return this.publicData.producoes();
  }

  @Get('orientacoes')
  orientacoes() {
    return this.publicData.orientacoes();
  }

  @Get('projetos')
  projetos() {
    return this.publicData.projetos();
  }

  @Get('formacoes')
  formacoes() {
    return this.publicData.formacoes();
  }
}
