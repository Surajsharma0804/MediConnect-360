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
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AllergyService } from '../services/allergy.service';
import { CreateAllergyDto } from '../dto/create-allergy.dto';
import { UpdateAllergyDto } from '../dto/update-allergy.dto';

@Controller('ehr/allergies')
@UseGuards(JwtAuthGuard)
export class AllergyController {
  constructor(private readonly allergyService: AllergyService) {}

  @Post()
  async create(@Request() req, @Body() createDto: CreateAllergyDto) {
    return this.allergyService.create(req.user.userId, createDto);
  }

  @Get()
  async findAll(@Request() req) {
    return this.allergyService.findAll(req.user.userId);
  }

  @Get('severe')
  async getSevere(@Request() req) {
    return this.allergyService.getSevereAllergies(req.user.userId);
  }

  @Get('check-conflicts')
  async checkConflicts(
    @Request() req,
    @Query('medication') medication: string,
  ) {
    return this.allergyService.checkMedicationConflicts(
      req.user.userId,
      medication,
    );
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.allergyService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateAllergyDto,
  ) {
    return this.allergyService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.allergyService.remove(id, req.user.userId);
    return { message: 'Allergy deleted successfully' };
  }
}
