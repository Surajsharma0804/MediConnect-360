import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CareTeamService } from '../services/care-team.service';
import { CareTeamRole } from '../../entities/care-team.entity';

@Controller('care-coordination/team')
@UseGuards(JwtAuthGuard)
export class CareTeamController {
  constructor(private readonly careTeamService: CareTeamService) {}

  @Post()
  addMember(
    @Request() req,
    @Body()
    body: {
      providerId?: string;
      role: CareTeamRole;
      specialization?: string;
      notes?: string;
      isPrimary?: boolean;
    },
  ) {
    return this.careTeamService.addMember(req.user.userId, body);
  }

  @Get()
  findAll(@Request() req) {
    return this.careTeamService.findAll(req.user.userId);
  }

  @Get('primary')
  getPrimaryCareProvider(@Request() req) {
    return this.careTeamService.getPrimaryCareProvider(req.user.userId);
  }

  @Get('statistics')
  getStatistics(@Request() req) {
    return this.careTeamService.getStatistics(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.careTeamService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.careTeamService.update(id, req.user.userId, body);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.careTeamService.remove(id, req.user.userId);
  }

  @Post(':id/contact')
  logContact(@Request() req, @Param('id') id: string) {
    return this.careTeamService.logContact(id, req.user.userId);
  }
}
