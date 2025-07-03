import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { TaskUser } from '../entities/task-user.entity';
import { Repository, In, Like, Between, Raw, Brackets, Not } from 'typeorm';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { ResponseInterface } from 'src/core/interfaces/response.interface';
import { TaskDto } from '../dtos/task.dto';
import { plainToInstance } from 'class-transformer';
import { User } from 'src/users/entities/user.entity';
import { UserDto } from 'src/users/dtos/user.dto';
import { ListTaskDto } from '../dtos/list-task.dto';
import * as moment from 'moment';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { IsNotIn } from 'class-validator';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(TaskUser)
    private readonly taskUserRepository: Repository<TaskUser>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createTaskDto: CreateTaskDto,
  ): Promise<ResponseInterface<TaskDto>> {
    try {
      // Creacion de tarea
      if (createTaskDto.status === 'completed') {
        createTaskDto.completedDate = moment().toDate();
      }
      const taskEntity = this.taskRepository.create(createTaskDto);
      const savedTask = await this.taskRepository.save(taskEntity);

      // 5) Preparamos el DTO de respuesta
      const parsedTask = plainToInstance(TaskDto, savedTask, {
        excludeExtraneousValues: true,
      });

      // Busqueda de usuarios asignados
      if (createTaskDto.taskUsers?.length) {
        const userIds = createTaskDto.taskUsers;

        const users = await this.userRepository.findBy({
          id: In(userIds),
        });

        // 3) Verificamos que todos existan
        if (users.length !== userIds.length) {
          throw new NotFoundException(
            'Alguno de los usuarios especificados no existe',
          );
        }

        // Relacion tarea usuarios
        const relations = users.map((user) =>
          this.taskUserRepository.create({
            task: { id: savedTask.id },
            user: { id: user.id },
          }),
        );
        await this.taskUserRepository.save(relations);
        parsedTask.taskUsers = plainToInstance(UserDto, users, {
          excludeExtraneousValues: true,
        });
      }

      return {
        statusCode: 201,
        message: 'Tarea creada exitosamente',
        data: parsedTask,
        timestamp: new Date().toISOString(),
        path: '/tasks',
      };
    } catch (error) {
      // Mapeo de errores
      if (error instanceof NotFoundException) {
        return {
          statusCode: 404,
          message: error.message,
          error: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString(),
          path: '/tasks',
        };
      }

      let errorCode = 'INTERNAL_SERVER_ERROR';
      let errorMessage = 'Error interno al crear la tarea';

      switch (error.code) {
        case '23505':
          errorCode = 'TASK_CONFLICT';
          errorMessage = 'Ya existe una tarea con esos datos';
          break;
        case '23502':
          errorCode = 'TASK_MISSING_FIELDS';
          errorMessage = 'Faltan campos obligatorios para crear la tarea';
          break;
        case '23503':
          errorCode = 'FK_VIOLATION';
          errorMessage = 'Relación con usuario o tarea inválida';
          break;
      }

      return {
        statusCode: 500,
        message: errorMessage,
        error: errorCode,
        timestamp: new Date().toISOString(),
        path: '/tasks',
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
    userId?: number,
    limitDate?: Date,
  ): Promise<ResponseInterface<ListTaskDto>> {
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

      if (sortBy && !['id', 'name', 'status'].includes(sortBy)) {
        sortBy = 'id';
      }

      const taskQuey = this.taskRepository
        .createQueryBuilder('tasks')
        .leftJoinAndSelect('tasks.taskUsers', 'taskUsers')
        .leftJoinAndSelect('taskUsers.user', 'users');

      if (status) {
        taskQuey.andWhere('tasks.status = :status', { status });
      }

      if (limitDate) {
        const start = moment(limitDate).startOf('day').toDate();
        const end = moment(limitDate).endOf('day').toDate();
        taskQuey.andWhere('tasks.limitDate BETWEEN :start AND :end', {
          start,
          end,
        });
      }

      if (userId) {
        taskQuey.andWhere('users.id = :userId', { userId });
      }

      if (search) {
        search = `%${search.trim().toLowerCase()}%`;
        taskQuey.andWhere(
          new Brackets((b) => {
            b.where('LOWER(tasks.name) LIKE :search', { search })
              .orWhere('LOWER(tasks.description) LIKE :search', { search })
              .orWhere('LOWER(users.name) LIKE :search', { search })
              .orWhere('LOWER(users.email) LIKE :search', { search });
          }),
        );
      }

      taskQuey
        .orderBy(`tasks.${sortBy}`, sort.toUpperCase() as 'ASC' | 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [tasks, total] = await taskQuey.getManyAndCount();

      const parsedTasks = tasks.map((task) =>
        plainToInstance(TaskDto, task, { excludeExtraneousValues: true }),
      );

      const listTaskDto = new ListTaskDto();
      listTaskDto.tasks = parsedTasks;
      listTaskDto.page = page;
      listTaskDto.limit = limit;
      listTaskDto.total = total;

      return {
        statusCode: 200,
        message: 'Tareas obtenidas exitosamente',
        data: listTaskDto,
        timestamp: new Date().toISOString(),
        path: '/tasks',
      };
    } catch (error) {
      let errorCode = 'INTERNAL_SERVER_ERROR';
      let errorMessage = 'Error interno al obtener las tareas';

      switch (error.code) {
        case '22P02':
          errorMessage = 'Selección estado inválido';
          errorCode = 'TASK_INVALID_STATUS';
          break;
        case '23502':
          errorMessage = 'Faltan campos obligatorios';
          errorCode = 'TASK_MISSING_REQUIRED_FIELDS';
          break;
      }

      return {
        statusCode: 500,
        message: errorMessage,
        error: errorCode,
        timestamp: new Date().toISOString(),
        path: '/tasks',
      };
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateTaskDto,
  ): Promise<ResponseInterface<TaskDto>> {
    try {
      const task = await this.taskRepository.findOneBy({
        id: id,
      });

      if (!task) {
        return {
          statusCode: 404,
          message: 'Tarea no encontrada',
          error: 'TASK_NOT_FOUND',
          timestamp: new Date().toISOString(),
          path: '/tasks/:id',
        };
      }
      let updateData = {};
      if (updateUserDto.name) {
        updateData['name'] = updateUserDto.name;
      }
      if (updateUserDto.description) {
        updateData['description'] = updateUserDto.description;
      }
      if (updateUserDto.estimatedTime) {
        updateData['estimatedTime'] = updateUserDto.estimatedTime;
      }
      if (updateUserDto.limitDate) {
        updateData['limitDate'] = updateUserDto.limitDate;
      }
      if (updateUserDto.status) {
        updateData['status'] = updateUserDto.status;
        if (updateUserDto.status === 'completed') {
          updateData['completedDate'] = moment().toDate();
        }
      }
      if (updateUserDto.cost) {
        updateData['cost'] = updateUserDto.cost;
      }
      if (updateUserDto.currency) {
        updateData['currency'] = updateUserDto.currency;
      }
      if (updateUserDto.taskUsers) {
        const userIds = updateUserDto.taskUsers;

        const users = await this.userRepository.findBy({
          id: In(userIds),
        });

        // Verificamos que todos existan
        if (users.length !== userIds.length) {
          throw new NotFoundException(
            'Alguno de los usuarios especificados no existe',
          );
        }

        let asignedUsers = await this.taskUserRepository.find({
          where: { task: { id: task.id } },
          relations: ['user'],
        });

        if (asignedUsers.length > 0) {
          if (userIds.length > 0) {
            await this.taskUserRepository.delete({
              task: { id: task.id },
              user: { id: Not(In(userIds)) },
            });
          } else {
            await this.taskUserRepository.delete({
              task: { id: task.id },
            });
          }
        }

        let usersToAssign = userIds.filter(
          (userId) =>
            !asignedUsers.some((taskUser) => taskUser.user.id === userId),
        );
        if (usersToAssign.length > 0) {
          const relations = usersToAssign.map((user) =>
            this.taskUserRepository.create({
              task: { id: task.id },
              user: { id: user },
            }),
          );
          await this.taskUserRepository.save(relations);
        }
      }
      await this.taskRepository.update(id, updateData);
      let taskUpdated = await this.taskRepository.findOneBy({ id: id });
      return {
        statusCode: 200,
        message: 'Usuario actualizado exitosamente',
        data: plainToInstance(TaskDto, taskUpdated, {
          excludeExtraneousValues: true,
        }),
        timestamp: new Date().toISOString(),
        path: '/tasks/:id',
      };
    } catch (error) {
      let errorCode = 'INTERNAL_SERVER_ERROR';
      let errorMessage = 'Error interno al actualizar el usuario';

      switch (error.code) {
        case '23502':
          errorMessage = 'Faltan campos obligatorios';
          errorCode = 'USER_MISSING_REQUIRED_FIELDS';
          break;
        case '22P02':
          errorMessage = 'Selección de rol o estado inválidas';
          errorCode = 'USER_INVALID_ROLE_OR_STATUS';
          break;
      }

      return {
        statusCode: 500,
        message: errorMessage,
        error: errorCode,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async delete(id: number): Promise<ResponseInterface<void>> {
    try {
      const task = await this.taskRepository.findOneBy({ id: id });

      if (!task) {
        return {
          statusCode: 404,
          message: 'Tarea no encontrada',
          error: 'TASK_NOT_FOUND',
          timestamp: new Date().toISOString(),
          path: '/tasks/:id',
        };
      }
      await this.taskRepository.delete(id);
      return {
        statusCode: 200,
        message: 'Tarea eliminada exitosamente',
        data: undefined,
        timestamp: new Date().toISOString(),
        path: '/tasks/:id',
      };
    } catch (error) {
      let errorCode = 'INTERNAL_SERVER_ERROR';
      let errorMessage = 'Error interno al eliminar la tarea';

      switch (error.code) {
        case '23503':
          errorMessage =
            'No se puede eliminar la tarea, tiene usuarios asignados';
          errorCode = 'TASK_HAS_USERS';
          break;
      }
      return {
        statusCode: 500,
        message: errorMessage,
        error: errorCode,
        timestamp: new Date().toISOString(),
        path: '/tasks/:id',
      };
    }
  }
}
