import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { HsaFsaService } from '../services/hsa-fsa.service';

@Controller('api/insurance/hsa-fsa')
@UseGuards(JwtAuthGuard)
export class HsaFsaController {
  constructor(private readonly hsaFsaService: HsaFsaService) {}

  @Post()
  async create(@Request() req, @Body() accountData: any) {
    return this.hsaFsaService.create(req.user.userId, accountData);
  }

  @Get()
  async findAll(@Request() req) {
    return this.hsaFsaService.findByUser(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.hsaFsaService.findById(id, req.user.userId);
  }

  @Get(':id/balance')
  async getBalance(@Request() req, @Param('id') id: string) {
    return this.hsaFsaService.getBalance(id, req.user.userId);
  }

  @Post(':id/transaction')
  async processTransaction(
    @Request() req,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.hsaFsaService.processTransaction(
      id,
      req.user.userId,
      body.amount,
      body.description,
      body.type,
    );
  }
}
