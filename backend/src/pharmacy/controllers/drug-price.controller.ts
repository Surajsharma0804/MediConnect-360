import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  DrugPriceService,
  PriceComparison,
} from '../services/drug-price.service';
import { ComparePricesDto } from '../dto/compare-prices.dto';
import { DrugPrice } from '../../entities/drug-price.entity';

@Controller('api/drug-prices')
@UseGuards(JwtAuthGuard)
export class DrugPriceController {
  constructor(private readonly drugPriceService: DrugPriceService) {}

  @Post('compare')
  async comparePrices(@Body() dto: ComparePricesDto): Promise<PriceComparison> {
    return this.drugPriceService.comparePrices(
      dto.drugName,
      dto.dosage,
      dto.quantity,
      dto.zipCode,
    );
  }

  @Get('generic-alternatives')
  async findGenericAlternatives(
    @Query('brandName') brandName: string,
    @Query('dosage') dosage: string,
  ): Promise<DrugPrice[]> {
    return this.drugPriceService.findGenericAlternatives(brandName, dosage);
  }

  @Get('coupons')
  async getCoupons(
    @Query('drugName') drugName: string,
    @Query('dosage') dosage: string,
    @Query('quantity') quantity: number,
  ): Promise<DrugPrice[]> {
    return this.drugPriceService.getCoupons(drugName, dosage, quantity);
  }

  @Get('savings')
  async calculateSavings(
    @Query('drugName') drugName: string,
    @Query('dosage') dosage: string,
    @Query('quantity') quantity: number,
  ) {
    return this.drugPriceService.calculateSavings(drugName, dosage, quantity);
  }

  @Get('pharmacy/:pharmacyId')
  async getPricesByPharmacy(
    @Param('pharmacyId') pharmacyId: string,
  ): Promise<DrugPrice[]> {
    return this.drugPriceService.getPricesByPharmacy(pharmacyId);
  }

  @Post()
  async create(@Body() priceData: Partial<DrugPrice>): Promise<DrugPrice> {
    return this.drugPriceService.create(priceData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() priceData: Partial<DrugPrice>,
  ): Promise<DrugPrice> {
    return this.drugPriceService.update(id, priceData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.drugPriceService.delete(id);
    return { message: 'Drug price deleted successfully' };
  }
}
