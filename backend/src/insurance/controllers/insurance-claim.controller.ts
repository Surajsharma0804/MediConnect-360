import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { InsuranceClaimService } from '../services/insurance-claim.service';
import '../../types/multer';
import { CreateClaimDto } from '../dto/create-claim.dto';
import { UpdateClaimDto } from '../dto/update-claim.dto';

@Controller('insurance/claims')
@UseGuards(JwtAuthGuard)
export class InsuranceClaimController {
  constructor(private readonly claimService: InsuranceClaimService) {}

  @Get()
  findAll(@Request() req) {
    return this.claimService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.claimService.findOne(id, req.user.userId);
  }

  @Post()
  create(@Request() req, @Body() createClaimDto: CreateClaimDto) {
    return this.claimService.create(req.user.userId, createClaimDto);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateClaimDto: UpdateClaimDto,
  ) {
    return this.claimService.update(id, req.user.userId, updateClaimDto);
  }

  @Post(':id/submit')
  submit(@Request() req, @Param('id') id: string) {
    return this.claimService.submit(id, req.user.userId);
  }

  @Get(':id/status')
  getStatus(@Request() req, @Param('id') id: string) {
    return this.claimService.getStatus(id, req.user.userId);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('document'))
  uploadDocument(
    @Request() req,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('documentType') documentType: string,
  ) {
    return this.claimService.uploadDocument(
      id,
      req.user.userId,
      file,
      documentType,
    );
  }

  @Get(':id/documents')
  getDocuments(@Request() req, @Param('id') id: string) {
    return this.claimService.getDocuments(id, req.user.userId);
  }

  @Post(':id/appeal')
  appeal(@Request() req, @Param('id') id: string, @Body('reason') reason: string) {
    return this.claimService.appeal(id, req.user.userId, reason);
  }

  @Get(':id/history')
  getHistory(@Request() req, @Param('id') id: string) {
    return this.claimService.getHistory(id, req.user.userId);
  }
}