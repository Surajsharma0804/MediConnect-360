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
import { FamilyMemberService } from '../services/family-member.service';
import { CreateFamilyMemberDto } from '../dto/create-family-member.dto';
import { UpdateFamilyMemberDto } from '../dto/update-family-member.dto';
import { GrantAccessDto } from '../dto/grant-access.dto';

@Controller('family/members')
@UseGuards(JwtAuthGuard)
export class FamilyMemberController {
  constructor(private readonly familyMemberService: FamilyMemberService) {}

  @Post()
  async create(@Request() req, @Body() createDto: CreateFamilyMemberDto) {
    return this.familyMemberService.create(req.user.userId, createDto);
  }

  @Get()
  async findAll(@Request() req) {
    return this.familyMemberService.findAll(req.user.userId);
  }

  @Get('minors')
  async getMinors(@Request() req) {
    return this.familyMemberService.getMinors(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.familyMemberService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateFamilyMemberDto,
  ) {
    return this.familyMemberService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Request() req, @Param('id') id: string) {
    await this.familyMemberService.delete(id, req.user.userId);
  }

  @Post(':id/access')
  async grantAccess(
    @Request() req,
    @Param('id') id: string,
    @Body() grantAccessDto: GrantAccessDto,
  ) {
    return this.familyMemberService.grantAccess(
      id,
      req.user.userId,
      grantAccessDto,
    );
  }

  @Delete(':id/access')
  async revokeAccess(@Request() req, @Param('id') id: string) {
    return this.familyMemberService.revokeAccess(id, req.user.userId);
  }

  @Get(':id/records')
  async getSharedRecords(@Request() req, @Param('id') id: string) {
    return this.familyMemberService.getSharedRecords(id, req.user.userId);
  }
}
