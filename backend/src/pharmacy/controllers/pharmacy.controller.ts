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
import { PharmacyService } from '../services/pharmacy.service';
import { SearchPharmacyDto } from '../dto/search-pharmacy.dto';
import { Pharmacy } from '../../entities/pharmacy.entity';

@Controller('api/pharmacy')
@UseGuards(JwtAuthGuard)
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Get()
  async findAll(@Query() filters: SearchPharmacyDto): Promise<Pharmacy[]> {
    if (filters.latitude && filters.longitude) {
      return this.pharmacyService.findNearby(
        filters.latitude,
        filters.longitude,
        filters.radiusMiles || 10,
      );
    }
    return this.pharmacyService.findAll(filters);
  }

  @Get('chains')
  async getChains(): Promise<string[]> {
    return this.pharmacyService.getChains();
  }

  @Get('search')
  async search(@Query('name') name: string): Promise<Pharmacy[]> {
    return this.pharmacyService.searchByName(name);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Pharmacy> {
    return this.pharmacyService.findById(id);
  }

  @Post()
  async create(@Body() pharmacyData: Partial<Pharmacy>): Promise<Pharmacy> {
    return this.pharmacyService.create(pharmacyData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() pharmacyData: Partial<Pharmacy>,
  ): Promise<Pharmacy> {
    return this.pharmacyService.update(id, pharmacyData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.pharmacyService.delete(id);
    return { message: 'Pharmacy deleted successfully' };
  }
}
