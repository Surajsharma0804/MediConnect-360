import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ImmunizationService } from '../services/immunization.service';
import { CreateImmunizationDto } from '../dto/create-immunization.dto';
import { UpdateImmunizationDto } from '../dto/update-immunization.dto';

@Controller('ehr/immunizations')
@UseGuards(JwtAuthGuard)
export class ImmunizationController {
  constructor(private readonly immunizationService: ImmunizationService) {}

  @Post()
  async create(@Request() req, @Body() createDto: CreateImmunizationDto) {
    return this.immunizationService.create(req.user.userId, createDto);
  }

  @Get()
  async findAll(@Request() req) {
    return this.immunizationService.findAll(req.user.userId);
  }

  @Get('due')
  async getDue(@Request() req) {
    return this.immunizationService.getDueVaccines(req.user.userId);
  }

  @Get('vaccine-card')
  async getVaccineCard(@Request() req) {
    return this.immunizationService.getVaccineCard(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.immunizationService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateImmunizationDto,
  ) {
    return this.immunizationService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.immunizationService.remove(id, req.user.userId);
    return { message: 'Immunization deleted successfully' };
  }
}
