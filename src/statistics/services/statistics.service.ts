import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseInterface } from 'src/core/interfaces/response.interface';
import { Task } from 'src/tasks/entities/task.entity';
import { Repository } from 'typeorm';
import { TaskCompleteMetricsDto } from '../dtos/task-complete-metrics.dto';
import * as moment from 'moment';
import { TaskCompleteAverageTimeMetricsDto } from '../dtos/task-complete-average-time-metrics.dto';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async getTasksCompletedByRange(
    startDate: string,
    endDate: string,
  ): Promise<ResponseInterface<TaskCompleteMetricsDto[]>> {
    if (!startDate || !endDate) {
      return {
        statusCode: 400,
        message: 'startDate y endDate son requeridos',
        error: 'Bad Request',
        timestamp: new Date().toISOString(),
        path: '/statistics/tasks-completed-by-day',
      };
    }
    let start = new Date(startDate);
    let end = new Date(endDate);

    // Validar que sean fechas válidas
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        statusCode: 400,
        message: 'startDate y endDate deben ser fechas válidas',
        error: 'Bad Request',
        timestamp: new Date().toISOString(),
        path: '/statistics/tasks-completed-by-day',
      };
    }
    start = moment(startDate).startOf('day').toDate();
    end = moment(endDate).endOf('day').toDate();

    const raw = await this.taskRepository.query(
      `
        SELECT 
            date_range_metrics.date::text AS date,
            COALESCE(count_tasks_completed.count, 0)::text AS count
        FROM (
            SELECT generate_series($1::date, $2::date, '1 day') AS date
        ) AS date_range_metrics
        LEFT JOIN (
            SELECT 
            completed_date::date AS date,
            COUNT(*) AS count
            FROM tasks
            WHERE tasks.status = $3
            AND tasks.completed_date BETWEEN $1::date AND $2::date
            GROUP BY tasks.completed_date::date
        ) AS count_tasks_completed
            ON count_tasks_completed.date = date_range_metrics.date
        ORDER BY date_range_metrics.date;
      `,
      [start, end, 'completed'],
    );

    // 3) Mapeo a DTO
    const metrics: TaskCompleteMetricsDto[] = raw.map((r) => ({
      date: r.date,
      count: parseInt(r.count, 10),
    }));

    return {
      statusCode: 200,
      message: 'Métrica de tareas completadas por día obtenida exitosamente',
      data: metrics,
      timestamp: new Date().toISOString(),
      path: '/statistics/tasks-completed-by-day',
    };
  }

  async getAverageTimeToCompleteTasks(
    startDate: string,
    endDate: string,
  ): Promise<ResponseInterface<TaskCompleteAverageTimeMetricsDto>> {
    if (!startDate || !endDate) {
      return {
        statusCode: 400,
        message: 'startDate y endDate son requeridos',
        error: 'Bad Request',
        timestamp: new Date().toISOString(),
        path: '/statistics/tasks-completed-by-day',
      };
    }
    let start = new Date(startDate);
    let end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        statusCode: 400,
        message: 'startDate y endDate deben ser fechas válidas',
        error: 'Bad Request',
        timestamp: new Date().toISOString(),
        path: '/statistics/tasks-completed-by-day',
      };
    }
    start = moment(startDate).startOf('day').toDate();
    end = moment(endDate).endOf('day').toDate();

    const raw = await this.taskRepository.query(
      `
        SELECT 
            ROUND(AVG(EXTRACT(EPOCH FROM (tasks.completed_date - tasks.created)) / 3600)::numeric, 2) AS average_time
        FROM tasks
        WHERE tasks.status = 'completed' AND tasks.completed_date BETWEEN $1::timestamptz AND $2::timestamptz;
      `,
      [start, end],
    );

    if (raw.length === 0 || raw[0].average_time === null) {
      return {
        statusCode: 404,
        message: 'No se encontraron tareas completadas',
        error: 'Not Found',
        timestamp: new Date().toISOString(),
        path: '/statistics/average-time-to-complete-tasks',
      };
    }
    const averageTime = parseFloat(raw[0].average_time);
    const metrics: TaskCompleteAverageTimeMetricsDto = {
      averageTime,
    };
    return {
      statusCode: 200,
      message:
        'Métrica de tiempo promedio para completar tareas obtenida exitosamente',
      data: metrics,
      timestamp: new Date().toISOString(),
      path: '/statistics/average-time-to-complete-tasks',
    };
  }
}
