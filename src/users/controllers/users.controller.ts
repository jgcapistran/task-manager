import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UsersService } from '../services/users.service';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';
import { UserDto } from '../dtos/user.dto';
import { ResponseDto } from 'src/core/dtos/response.dto';
import { ListUserDto } from '../dtos/list-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiResponse({ status: 201, type: ResponseDto<UserDto> })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiResponse({ status: 201, type: ResponseDto<ListUserDto> })
  @ApiQuery({
    name: 'page',
    type: Number,
    description: 'Optional page number for pagination, defaults to 1',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    description: 'Optional limit for number of users per page, defaults to 10',
    required: false,
  })
  @ApiQuery({
    name: 'search',
    type: String,
    description: 'Optional search term to filter users by name or email',
    required: false,
  })
  @ApiQuery({
    name: 'sort',
    type: String,
    description:
      'Optional sort order, either "ASC" or "DESC", defaults to "ASC"',
    required: false,
  })
  @ApiQuery({
    name: 'sortBy',
    type: String,
    description: 'Optional field to sort by, defaults to "id"',
    required: false,
  })
  @ApiQuery({
    name: 'status',
    type: String,
    description: 'Optional filter by user status (e.g., "enabled", "disabled")',
    required: false,
  })
  @ApiQuery({
    name: 'role',
    type: String,
    description: 'Optional filter by user role (e.g., "admin", "user")',
    required: false,
  })
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('sortBy') sortBy?: string,
    @Query('status') status?: string,
    @Query('role') role?: string,
  ) {
    return this.usersService.findAll(
      search,
      page,
      limit,
      sort,
      sortBy,
      status,
      role,
    );
  }
}
