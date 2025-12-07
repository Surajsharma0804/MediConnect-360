import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ProviderService } from '../services/provider.service';
import { ProviderSearchService } from '../services/provider-search.service';

@Controller('providers')
export class ProviderController {
  constructor(
    private readonly providerService: ProviderService,
    private readonly searchService: ProviderSearchService,
  ) {}

  @Get()
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.providerService.findAll(
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
  }

  @Get('search')
  async search(
    @Query('specialization') specialization?: string,
    @Query('insurance') insurance?: string,
    @Query('minRating') minRating?: string,
    @Query('acceptingNew') acceptingNew?: string,
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
    @Query('radius') radius?: string,
    @Query('languages') languages?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const filters: any = {};

    if (specialization) filters.specialization = specialization;
    if (insurance) filters.insuranceAccepted = insurance.split(',');
    if (minRating) filters.minRating = parseFloat(minRating);
    if (acceptingNew) filters.acceptingNewPatients = acceptingNew === 'true';
    if (latitude) filters.latitude = parseFloat(latitude);
    if (longitude) filters.longitude = parseFloat(longitude);
    if (radius) filters.radiusKm = parseFloat(radius);
    if (languages) filters.languages = languages.split(',');

    return this.searchService.search(
      filters,
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0,
    );
  }

  @Get('nearby')
  async findNearby(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radius') radius?: string,
    @Query('limit') limit?: string,
  ) {
    return this.searchService.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      radius ? parseFloat(radius) : 50,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('specializations')
  async getSpecializations() {
    return this.searchService.getSpecializations();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.providerService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createDto: any) {
    return this.providerService.create(createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.providerService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    await this.providerService.remove(id);
    return { message: 'Provider deleted successfully' };
  }
}
