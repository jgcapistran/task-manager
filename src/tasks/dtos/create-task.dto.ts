import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsTimeZone,
} from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Nombre de la tarea',
    example: '(Backend): Endpoint para actualización de usuario',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Descripción de la tarea',
    example:
      'Para actualizar un usuario, se debe enviar el ID del usuario y los campos a actualizar, como nombre, correo electrónico, rol y estado. El endpoint debe validar que el correo electrónico no esté en uso por otro usuario y que el rol y estado sean válidos. El endpoint debe retornar el usuario actualizado.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Estimación de tiempo en horas para completar la tarea',
    example: '5.5',
  })
  @IsNotEmpty()
  @IsNumber()
  estimatedTime: number;

  @ApiProperty({
    description:
      'Fecha limite para completar la tarea en formato timestamp con zona horaria',
    example: '2025-07-02 00:15:38.444621-06',
  })
  @IsNotEmpty()
  @IsTimeZone()
  limitDate: string;

  @ApiProperty({
    description: 'Estado de la tarea, puede ser: active o completed',
    enum: ['active', 'completed'],
    example: 'active',
  })
  @IsNotEmpty()
  @IsString()
  status: 'active' | 'completed';

  @ApiProperty({
    description: 'Fecha de finalización de la tarea, si está completada',
    example: '2025-07-02 00:15:38.444621-06',
    required: false,
  })
  @IsTimeZone()
  completedDate?: Date;

  @ApiProperty({
    description: 'Costo monetario estimado para completar la tarea',
    example: '100.00',
  })
  @IsNumber()
  @IsNotEmpty()
  cost: number;

  @ApiProperty({
    description: 'Costo monetario estimado para completar la tarea',
    enum: ['MXN'],
    example: 'MXN',
  })
  @IsString()
  @IsNotEmpty()
  currency: 'MXN';

  @ApiProperty({
    description: 'Usuarios asignados a la tarea',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray()
  taskUsers: number[];
}
