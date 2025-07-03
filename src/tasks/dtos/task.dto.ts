import { ApiResponseProperty } from '@nestjs/swagger';
import {
  Exclude,
  Expose,
  plainToInstance,
  Transform,
  Type,
} from 'class-transformer';
import { UserDto } from 'src/users/dtos/user.dto';
import { User } from 'src/users/entities/user.entity';
import { Timestamp } from 'typeorm';

@Exclude()
export class TaskDto {
  @Expose()
  @ApiResponseProperty({
    type: Number,
    example: 1,
  })
  id: number;

  @Expose()
  @ApiResponseProperty({
    type: String,
    example: 'Task Title',
  })
  name: string;

  @Expose()
  @ApiResponseProperty({
    type: String,
    example: 'This is a task description.',
  })
  description: string;

  @Expose()
  @ApiResponseProperty({
    type: Number,
    example: '5.00',
  })
  estimatedTime: Number;

  @Expose()
  @ApiResponseProperty({
    type: Timestamp,
    example: '2025-07-02 00:15:38.444621-06',
  })
  limitDate: Timestamp;

  @Expose()
  @ApiResponseProperty({
    type: String,
    enum: ['active', 'completed'],
  })
  status: string;

  @Expose()
  @ApiResponseProperty({
    type: Number,
    example: '100.00',
  })
  cost: Number;

  @Expose()
  @ApiResponseProperty({
    type: String,
    enum: ['MXN'],
  })
  currency: string;

  @Expose()
  @Transform(
    ({ obj }) =>
      obj.taskUsers?.map((taskUsers: any) =>
        plainToInstance(UserDto, taskUsers.user, {
          excludeExtraneousValues: true,
        }),
      ) ?? [],
    { toClassOnly: true },
  )
  @Type(() => UserDto)
  @ApiResponseProperty({
    type: [UserDto],
    example: [
      {
        id: 1,
        name: 'John Doe',
        email: 'lorem@ipsjum.com',
        role: 'user',
        status: 'enabled',
      },
    ],
  })
  taskUsers: UserDto[];
}
