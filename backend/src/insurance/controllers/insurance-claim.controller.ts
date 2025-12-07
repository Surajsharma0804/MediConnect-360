import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { InsuranceClaimService } from '../services/insurance-claim.service';

@Controller('api/insurance/claims')
@UseGuards(JwtAuthGuard)
export class InsuranceClaimController {
  constructor(private readonly claimService: InsuranceClaimService) {}

  @Post()
  async create(@Request() req, @Body() claimData: any) {
    return this.claimService.create(req.user.userId, claimData);
  }

  @Get()
  async findAll(@Request() req) {
    return this.claimService.findByUser(req.user.userId);
  }

  @Get('summary')
  async getSummary(@Request() req) {
    return this.claimService.getClaimsSummary(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.claimService.findById(id, req.user.userId);
  }

  @Post(':id/submit')
  async submit(@Request() req, @Param('id') id: string) {
    return this.claimService.submit(id, req.user.userId);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: any) {
    return this.claimService.updateStatus(id, body.status, body.notes);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@Request() req, @Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.claimService.uploadDocument(id, req.user.userId, file.buffer, file.originalname);
  }
}
