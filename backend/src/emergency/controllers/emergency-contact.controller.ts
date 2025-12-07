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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EmergencyContactService } from '../services/emergency-contact.service';
import { CreateEmergencyContactDto } from '../dto/create-emergency-contact.dto';
import { UpdateEmergencyContactDto } from '../dto/update-emergency-contact.dto';

@Controller('emergency/contacts')
@UseGuards(JwtAuthGuard)
export class EmergencyContactController {
  constructor(
    private readonly emergencyContactService: EmergencyContactService,
  ) {}

  @Post()
  async create(@Request() req, @Body() createDto: CreateEmergencyContactDto) {
    return this.emergencyContactService.create(req.user.userId, createDto);
  }

  @Get()
  async findAll(@Request() req) {
    return this.emergencyContactService.findAll(req.user.userId);
  }

  @Get('primary')
  async getPrimary(@Request() req) {
    return this.emergencyContactService.getPrimary(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.emergencyContactService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateEmergencyContactDto,
  ) {
    return this.emergencyContactService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Request() req, @Param('id') id: string) {
    await this.emergencyContactService.delete(id, req.user.userId);
  }

  @Put('reorder')
  async reorder(@Request() req, @Body('orderedIds') orderedIds: string[]) {
    return this.emergencyContactService.reorder(req.user.userId, orderedIds);
  }
}
