import { ApiResponseProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { UserDto } from './user.dto';

@Exclude()
export class ListUserDto {
  @Expose()
  @ApiResponseProperty({
    type: [UserDto],
  })
  users: UserDto[];

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
