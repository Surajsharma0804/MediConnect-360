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
import { CarePlanService } from '../services/care-plan.service';

@Controller('care-coordination/plans')
@UseGuards(JwtAuthGuard)
export class CarePlanController {
  constructor(private readonly carePlanService: CarePlanService) {}

  @Post()
  create(@Request() req, @Body() body: any) {
    return this.carePlanService.create(req.user.userId, body);
  }

  @Get()
  findAll(@Request() req) {
    return this.carePlanService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.carePlanService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.carePlanService.update(id, req.user.userId, body);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.carePlanService.delete(id, req.user.userId);
  }

  @Post(':id/goals')
  addGoal(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.carePlanService.addGoal(id, req.user.userId, body);
  }

  @Patch(':id/goals/:goalId')
  updateGoal(
    @Request() req,
    @Param('id') id: string,
    @Param('goalId') goalId: string,
    @Body() body: any,
  ) {
    return this.carePlanService.updateGoal(id, req.user.userId, goalId, body);
  }

  @Post(':id/tasks')
  addTask(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.carePlanService.addTask(id, req.user.userId, body);
  }

  @Patch(':id/tasks/:taskId')
  completeTask(
    @Request() req,
    @Param('id') id: string,
    @Param('taskId') taskId: string,
  ) {
    return this.carePlanService.completeTask(id, req.user.userId, taskId);
  }

  @Get(':id/progress')
  getProgress(@Request() req, @Param('id') id: string) {
    return this.carePlanService.getProgress(id, req.user.userId);
  }

  @Post(':id/review')
  reviewPlan(@Request() req, @Param('id') id: string) {
    return this.carePlanService.reviewPlan(id, req.user.userId);
  }
}
