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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { InsuranceCardService } from '../services/insurance-card.service';
import { CreateInsuranceCardDto } from '../dto/create-insurance-card.dto';

@Controller('api/insurance/cards')
@UseGuards(JwtAuthGuard)
export class InsuranceCardController {
  constructor(private readonly insuranceCardService: InsuranceCardService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateInsuranceCardDto) {
    return this.insuranceCardService.create(req.user.userId, dto);
  }

  @Post('scan')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'front', maxCount: 1 },
      { name: 'back', maxCount: 1 },
    ]),
  )
  async scanCard(
    @Request() req,
    @UploadedFiles()
    files: { front?: Express.Multer.File[]; back?: Express.Multer.File[] },
  ) {
    const frontImage = files.front?.[0]?.buffer;
    const backImage = files.back?.[0]?.buffer;
    if (!frontImage) {
      throw new Error('Front image is required');
    }
    return this.insuranceCardService.scanCard(
      req.user.userId,
      frontImage,
      backImage,
    );
  }

  @Get()
  async findAll(@Request() req) {
    return this.insuranceCardService.findByUser(req.user.userId);
  }

  @Get('primary')
  async getPrimary(@Request() req) {
    return this.insuranceCardService.getPrimaryCard(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.insuranceCardService.findById(id, req.user.userId);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: Partial<CreateInsuranceCardDto>,
  ) {
    return this.insuranceCardService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    await this.insuranceCardService.delete(id, req.user.userId);
    return { message: 'Insurance card deleted successfully' };
  }

  @Post(':id/verify')
  async verify(@Request() req, @Param('id') id: string) {
    return this.insuranceCardService.verifyInsurance(id, req.user.userId);
  }

  @Post(':id/check-eligibility')
  async checkEligibility(
    @Request() req,
    @Param('id') id: string,
    @Body('serviceType') serviceType: string,
  ) {
    return this.insuranceCardService.checkEligibility(
      id,
      req.user.userId,
      serviceType,
    );
  }
}
