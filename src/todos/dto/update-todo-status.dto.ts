import { IsEnum } from 'class-validator';
import { TodoStatus } from '../todo-status.enum';

export class UpdateTodoStatusDto {
  @IsEnum(TodoStatus)
  status!: TodoStatus;
}
