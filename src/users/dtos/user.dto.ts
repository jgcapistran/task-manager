import { ApiResponseProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserDto {
  @Expose()
  @ApiResponseProperty({
    type: Number,
    example: 1,
  })
  id: number;

  @Expose()
  @ApiResponseProperty({
    type: String,
    example: 'Juan',
  })
  name: string;

  @Expose()
  @ApiResponseProperty({
    type: String,
    example: 'Lopez',
  })
  lastName: string;

  @Expose()
  @ApiResponseProperty({
    type: String,
    example: 'Martinez',
  })
  secondLastName: string;

  @Expose()
  @ApiResponseProperty({
    type: String,
    example: 'lorem@ipsum.com',
  })
  email: string;

  @Expose()
  @ApiResponseProperty({
    type: String,
    enum: ['admin', 'user'],
  })
  role: string;

  @Expose()
  @ApiResponseProperty({
    type: String,
    enum: ['enabled', 'disabled'],
  })
  status: string;

  @Expose()
  @ApiResponseProperty({
    type: Number,
    example: 100.0,
  })
  tasksCompletedCost: number;

  @Expose()
  @ApiResponseProperty({
    type: Number,
    example: 5,
  })
  tasksCompletedCount: number;
}
