import { ApiResponseProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TaskCompleteMetricsDto {
  @Expose()
  @ApiResponseProperty({
    type: String,
    example: '2025-07-02',
  })
  date: String;

  @Expose()
  @ApiResponseProperty({
    type: Number,
    example: 1,
  })
  count: number;
}
