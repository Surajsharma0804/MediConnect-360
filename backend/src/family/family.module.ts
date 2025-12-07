import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyMember } from '../entities/family-member.entity';
import { FamilyMemberService } from './services/family-member.service';
import { FamilyMemberController } from './controllers/family-member.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FamilyMember])],
  controllers: [FamilyMemberController],
  providers: [FamilyMemberService],
  exports: [FamilyMemberService],
})
export class FamilyModule {}
