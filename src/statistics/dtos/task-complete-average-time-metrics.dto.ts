import { ApiResponseProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TaskCompleteAverageTimeMetricsDto {
  @Expose()
  @ApiResponseProperty({
    type: Number,
    example: 1,
  })
  averageTime: number;
}
