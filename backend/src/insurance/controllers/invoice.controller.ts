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
import { InvoiceService } from '../services/invoice.service';

@Controller('api/insurance/invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  async create(@Request() req, @Body() invoiceData: any) {
    return this.invoiceService.create(req.user.userId, invoiceData);
  }

  @Get()
  async findAll(@Request() req) {
    return this.invoiceService.findByUser(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.invoiceService.findById(id, req.user.userId);
  }

  @Post(':id/pay')
  async markAsPaid(
    @Request() req,
    @Param('id') id: string,
    @Body() paymentDetails: any,
  ) {
    return this.invoiceService.markAsPaid(id, req.user.userId, paymentDetails);
  }

  @Post(':id/superbill')
  async generateSuperbill(@Request() req, @Param('id') id: string) {
    const url = await this.invoiceService.generateSuperbill(
      id,
      req.user.userId,
    );
    return { superbillUrl: url };
  }
}
