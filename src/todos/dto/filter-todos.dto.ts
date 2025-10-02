import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { TodoStatus } from '../todo-status.enum';

export class FilterTodosDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.filter((status) => !!status);
    }
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((status) => status.trim())
        .filter((status) => !!status);
    }
    return undefined;
  })
  @IsEnum(TodoStatus, {
    each: true,
    message: 'status must be New, In Progress, or Completed'
  })
  status?: TodoStatus[];
}
