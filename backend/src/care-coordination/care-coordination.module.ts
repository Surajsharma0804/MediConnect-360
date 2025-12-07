import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareTeamMember } from '../entities/care-team.entity';
import { CarePlan } from '../entities/care-plan.entity';
import { User } from '../entities/user.entity';
import { Provider } from '../entities/provider.entity';
import { CareTeamService } from './services/care-team.service';
import { CarePlanService } from './services/care-plan.service';
import { CareTeamController } from './controllers/care-team.controller';
import { CarePlanController } from './controllers/care-plan.controller';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CareTeamMember, CarePlan, User, Provider]),
  ],
  controllers: [CareTeamController, CarePlanController],
  providers: [
    CareTeamService,
    CarePlanService,
    NotificationService,
    EmailService,
  ],
  exports: [CareTeamService, CarePlanService],
})
export class CareCoordinationModule {}
