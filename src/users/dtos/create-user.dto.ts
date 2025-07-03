import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    name: 'name',
    description: 'Nombres',
    example: 'Juan',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    name: 'lastName',
    description: 'Apellido paterno',
    example: 'Perez',
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    name: 'secondLastName',
    description: 'Apellido materno',
    example: 'Martinez',
  })
  @IsNotEmpty()
  @IsString()
  secondLastName: string;

  @ApiProperty({
    name: 'email',
    description: 'Correo electrónico',
    example: 'juanperez@example.com',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    name: 'role',
    description: 'Rol del usuario, actualmente existen dos roles: admin y user',
    example: 'user',
  })
  @IsNotEmpty()
  @IsString()
  role: 'admin' | 'user';

  @ApiProperty({
    name: 'status',
    description: 'Estatus del usuario, puede ser: enabled o disabled',
    example: 'enabled',
  })
  @IsString()
  @IsNotEmpty()
  status: 'enabled' | 'disabled';
}
