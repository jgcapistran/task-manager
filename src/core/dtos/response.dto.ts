import { Optional } from '@nestjs/common';
import { ApiResponseProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Timestamp } from 'typeorm';

@Exclude()
export class ResponseDto<T> {
  @Expose()
  @ApiResponseProperty({
    type: Number,
    example: 500,
  })
  statusCode: number;

  @Expose()
  @ApiResponseProperty({
    type: String,
    example: 'El correo electrónico ya está en uso',
  })
  message: string;

  @Expose()
  @ApiResponseProperty({
    type: String,
    example: 'USER_EMAIL_ALREADY_EXISTS',
  })
  error: string;

  @Expose()
  @ApiResponseProperty({
    type: Object,
  })
  data?: T;

  @Expose()
  @ApiResponseProperty({
    type: Date,
    example: '2025-07-02T07:15:06.630Z',
  })
  timestamp: Timestamp;

  @Expose()
  @ApiResponseProperty({
    type: String,
    example: '/users',
  })
  path: string;
}
