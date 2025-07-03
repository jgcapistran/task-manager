import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { TasksService } from '../services/tasks.service';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ResponseDto } from 'src/core/dtos/response.dto';
import { TaskDto } from '../dtos/task.dto';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { ListTaskDto } from '../dtos/list-task.dto';
import { Timestamp } from 'typeorm';
import { UpdateTaskDto } from '../dtos/update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiResponse({ status: 201, type: ResponseDto<TaskDto> })
  @Post()
  async create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @ApiResponse({ status: 201, type: ResponseDto<ListTaskDto> })
  @ApiQuery({
    name: 'page',
    type: Number,
    description: 'Optional page number for pagination, defaults to 1',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    description: 'Optional limit for number of users per page, defaults to 10',
    required: false,
  })
  @ApiQuery({
    name: 'search',
    type: String,
    description: 'Optional search term to filter users by name or email',
    required: false,
  })
  @ApiQuery({
    name: 'sort',
    type: String,
    description:
      'Optional sort order, either "ASC" or "DESC", defaults to "ASC"',
    required: false,
  })
  @ApiQuery({
    name: 'sortBy',
    type: String,
    description: 'Optional field to sort by, defaults to "id"',
    required: false,
  })
  @ApiQuery({
    name: 'status',
    type: String,
    description: 'Optional filter by user status (e.g., "active", "completed")',
    required: false,
  })
  @ApiQuery({
    name: 'userId',
    type: Number,
    description: 'Optional filter by user ID to find tasks assigned to a user',
    required: false,
  })
  @ApiQuery({
    name: 'limitDate',
    type: Date,
    description: 'Optional filter by task limit date',
    required: false,
  })
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('sortBy') sortBy?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: number,
    @Query('limitDate') limitDate?: Date,
  ) {
    return this.tasksService.findAll(
      search,
      page,
      limit,
      sort,
      sortBy,
      status,
      userId,
      limitDate,
    );
  }

  @ApiResponse({ status: 201, type: ResponseDto<TaskDto> })
  @Put(':id')
  async createTask(
    @Body() createTaskDto: UpdateTaskDto,
    @Param('id') id: number,
  ) {
    return this.tasksService.update(id, createTaskDto);
  }

  @ApiResponse({ status: 200, type: ResponseDto<void> })
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.tasksService.delete(id);
  }
}
