import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { FilterTodosDto } from './dto/filter-todos.dto';
import { UpdateTodoStatusDto } from './dto/update-todo-status.dto';
import { TodoEntity } from './todo.entity';
import { TodosService } from './todos.service';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  list(@Query() filter: FilterTodosDto): Promise<TodoEntity[]> {
    return this.todosService.list(filter);
  }

  @Post()
  create(@Body() payload: CreateTodoDto): Promise<TodoEntity> {
    return this.todosService.create(payload);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: UpdateTodoStatusDto
  ): Promise<TodoEntity> {
    return this.todosService.updateStatus(id, payload);
  }
}
