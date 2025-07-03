import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Like, Raw, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ResponseInterface } from 'src/core/interfaces/response.interface';
import { plainToClass, plainToInstance } from 'class-transformer';
import { UserDto } from '../dtos/user.dto';
import { ListUserDto } from '../dtos/list-user.dto';
import { TaskUser } from 'src/tasks/entities/task-user.entity';
import { UpdateTaskDto } from 'src/tasks/dtos/update-task.dto';
import { TaskDto } from 'src/tasks/dtos/task.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<ResponseInterface<UserDto>> {
    try {
      const newUser = this.userRepository.create(createUserDto);
      const savedUser = await this.userRepository.save(newUser);
      const parsedUser = plainToInstance(UserDto, savedUser, {
        excludeExtraneousValues: true,
      });
      return {
        statusCode: 201,
        message: 'Usuario creado exitosamente',
        data: parsedUser,
        timestamp: new Date().toISOString(),
        path: '/users',
      };
    } catch (error) {
      let errorCode = '';
      let errorMessage = '';
      switch (error.code) {
        case '23505':
          errorMessage = 'El correo electrónico ya está en uso';
          errorCode = 'USER_EMAIL_ALREADY_EXISTS';
          break;

        case '23502':
          errorMessage = 'Faltan campos obligatorios';
          errorCode = 'USER_MISSING_REQUIRED_FIELDS';
          break;

        case '22P02':
          errorMessage = 'Selección de rol o estado inválidas';
          errorCode = 'USER_INVALID_ROLE_OR_STATUS';
          break;

        default:
          errorCode = error.code || 'INTERNAL_SERVER_ERROR';
          errorMessage =
            error.message || 'Error interno del servidor al crear el usuario';
          break;
      }

      return {
        statusCode: 500,
        message: errorMessage,
        error: errorCode,
        timestamp: new Date().toISOString(),
        path: '/users',
      };
    }
  }

  async findAll(
    search?: string,
    page?: number,
    limit?: number,
    sort: string = 'ASC',
    sortBy: string = 'id',
    status?: string,
    role?: string,
  ): Promise<ResponseInterface<ListUserDto>> {
    try {
      if (!page || page < 1) {
        page = 1;
      }

      if (!limit || limit < 1) {
        limit = 10;
      }

      if (sort && !['ASC', 'DESC'].includes(sort.toUpperCase())) {
        sort = 'ASC';
      }

      if (
        sortBy &&
        !['id', 'name', 'email', 'role', 'status'].includes(sortBy)
      ) {
        sortBy = 'id';
      }

      const userQuery = await this.userRepository
        .createQueryBuilder('users')
        .loadRelationCountAndMap(
          'users.tasksCompletedCount',
          'users.taskUsers',
          'taskUsers',
          (subQuery) =>
            subQuery
              .leftJoin('taskUsers.task', 'tasks')
              .andWhere('tasks.status = :status', { status: 'completed' }),
        )
        .addSelect((subQuery) => {
          return subQuery
            .select('COALESCE(SUM(tasks.cost),0)', 'tasksCompletedCost')
            .from(TaskUser, 'taskUsers')
            .leftJoin('taskUsers.task', 'tasks')
            .where('taskUsers.user_id = users.id')
            .andWhere('tasks.status = :status', { status: 'completed' });
        }, 'tasksCompletedCost');

      if (status) {
        userQuery.where('users.status = :statusUser', { statusUser: status });
      }

      if (role) {
        userQuery.andWhere('users.role = :role', { role });
      }

      if (search) {
        search = `%${search.trim().toLowerCase()}%`;
        userQuery.andWhere(
          new Brackets((b) => {
            b.where('LOWER(users.email) LIKE :search', { search })
              .orWhere('LOWER(users.name) LIKE :search', { search })
              .orWhere('LOWER(users.last_name) LIKE :search', { search })
              .orWhere('LOWER(users.second_last_name) LIKE :search', {
                search,
              });
          }),
        );
      }
      userQuery
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(`users.${sortBy}`, sort as 'ASC' | 'DESC')
        .groupBy('users.id');

      const { entities: users, raw } = await userQuery.getRawAndEntities();

      const totalUsers = users.length;

      users.forEach((user, i) => {
        user.tasksCompletedCost = parseFloat(raw[i].tasksCompletedCost) || 0;
        let userParsed = plainToClass(UserDto, user, {
          excludeExtraneousValues: true,
        });

        return userParsed;
      });

      const listUserDto = new ListUserDto();
      listUserDto.users = users;
      listUserDto.page = page;
      listUserDto.limit = limit;
      listUserDto.total = totalUsers;

      return {
        statusCode: 200,
        message: 'Usuarios obtenidos exitosamente',
        data: listUserDto,
        timestamp: new Date().toISOString(),
        path: '/users',
      };
    } catch (error) {
      let errorCode = 'INTERNAL_SERVER_ERROR';
      let errorMessage = 'Error interno al obtener las tareas';

      switch (error.code) {
        case '22P02':
          errorMessage = 'Selección estado inválido';
          errorCode = 'USER_INVALID_STATUS';
          break;
        case '23502':
          errorMessage = 'Faltan campos obligatorios';
          errorCode = 'USER_MISSING_REQUIRED_FIELDS';
          break;
        case '42883':
          errorMessage = 'Campo de busqueda inválido';
          errorCode = 'USER_INVALID_SEARCH_FIELD';
          break;
      }

      return {
        statusCode: 500,
        message: errorMessage,
        error: errorCode,
        timestamp: new Date().toISOString(),
        path: '/users',
      };
    }
  }
}
