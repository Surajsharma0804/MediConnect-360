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
import { UpdateInsuranceCardDto } from '../dto/update-insurance-card.dto';
import '../../types/multer';

@Controller('insurance/cards')
@UseGuards(JwtAuthGuard)
export class InsuranceCardController {
  constructor(
    private readonly insuranceCardService: InsuranceCardService,
  ) {}

  @Get()
  findAll(@Request() req) {
    return this.insuranceCardService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.insuranceCardService.findOne(id, req.user.userId);
  }

  @Post()
  create(
    @Request() req,
    @Body() createInsuranceCardDto: CreateInsuranceCardDto,
  ) {
    return this.insuranceCardService.create(
      req.user.userId,
      createInsuranceCardDto,
    );
  }

  @Post(':id/upload-images')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'front', maxCount: 1 },
      { name: 'back', maxCount: 1 },
    ]),
  )
  uploadImages(
    @Request() req,
    @Param('id') id: string,
    @UploadedFiles()
    files: { front?: Express.Multer.File[]; back?: Express.Multer.File[] },
  ) {
    const frontImage = files.front?.[0]?.buffer;
    const backImage = files.back?.[0]?.buffer;

    return this.insuranceCardService.uploadImages(
      id,
      req.user.userId,
      frontImage,
      backImage,
    );
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateInsuranceCardDto: UpdateInsuranceCardDto,
  ) {
    return this.insuranceCardService.update(
      id,
      req.user.userId,
      updateInsuranceCardDto,
    );
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.insuranceCardService.remove(id, req.user.userId);
  }

  @Post(':id/verify')
  verify(@Request() req, @Param('id') id: string) {
    return this.insuranceCardService.verifyInsurance(id, req.user.userId);
  }

  @Get(':id/benefits')
  getBenefits(@Request() req, @Param('id') id: string) {
    return this.insuranceCardService.getBenefits(id, req.user.userId);
  }

  @Post(':id/eligibility-check')
  checkEligibility(@Request() req, @Param('id') id: string) {
    return this.insuranceCardService.checkEligibility(id, req.user.userId);
  }
}