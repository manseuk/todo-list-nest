import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { DEFAULT_VISIBLE_STATUSES, TodoStatus } from './todo-status.enum';
import { TodoEntity } from './todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { FilterTodosDto } from './dto/filter-todos.dto';
import { UpdateTodoStatusDto } from './dto/update-todo-status.dto';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(TodoEntity)
    private readonly todosRepository: Repository<TodoEntity>
  ) {}

  async list(filter: FilterTodosDto): Promise<TodoEntity[]> {
    const statuses = filter.status?.length ? filter.status : DEFAULT_VISIBLE_STATUSES;

    return this.todosRepository.find({
      where: {
        status: In(statuses)
      },
      order: { createdAt: 'DESC' }
    });
  }

  async create(payload: CreateTodoDto): Promise<TodoEntity> {
    const todo = this.todosRepository.create({
      title: payload.title,
      description: payload.description ?? null,
      status: payload.status ?? TodoStatus.NEW
    });

    return this.todosRepository.save(todo);
  }

  async updateStatus(id: string, payload: UpdateTodoStatusDto): Promise<TodoEntity> {
    const todo = await this.todosRepository.findOne({ where: { id } });

    if (!todo) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }

    todo.status = payload.status;

    return this.todosRepository.save(todo);
  }
}
