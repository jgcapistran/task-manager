import { ApiResponseProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { TaskDto } from './task.dto';

@Exclude()
export class ListTaskDto {
  @Expose()
  @ApiResponseProperty({
    type: [TaskDto],
  })
  tasks: TaskDto[];

  @Expose()
  @ApiResponseProperty({
    type: Number,
    example: 1,
  })
  page: number;

  @Expose()
  @ApiResponseProperty({
    type: Number,
    example: 10,
  })
  limit: number;

  @Expose()
  @ApiResponseProperty({
    type: Number,
    example: 100,
  })
  total: number;
}
