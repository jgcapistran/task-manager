import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { StatisticsService } from '../services/statistics.service';
import { ResponseInterface } from 'src/core/interfaces/response.interface';
import { TaskCompleteMetricsDto } from '../dtos/task-complete-metrics.dto';
import { TaskCompleteAverageTimeMetricsDto } from '../dtos/task-complete-average-time-metrics.dto';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('tasks-completed/range')
  async getTasksCompleted(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<ResponseInterface<TaskCompleteMetricsDto[]>> {
    return this.statisticsService.getTasksCompletedByRange(startDate, endDate);
  }

  @Get('tasks-completed/average-time')
  async getAverageTimeToCompleteTasks(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<ResponseInterface<TaskCompleteAverageTimeMetricsDto>> {
    return this.statisticsService.getAverageTimeToCompleteTasks(
      startDate,
      endDate,
    );
  }
}
