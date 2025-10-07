import { TodoStatus } from './todo-status.enum';
import { TodoEntity } from './todo.entity';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

describe('TodosController', () => {
  let service: jest.Mocked<TodosService>;
  let controller: TodosController;

  const sampleTodo = (overrides: Partial<TodoEntity> = {}): TodoEntity => ({
    id: overrides.id ?? 'todo-id',
    title: overrides.title ?? 'Sample todo',
    description: overrides.description ?? null,
    status: overrides.status ?? TodoStatus.NEW,
    createdAt: overrides.createdAt ?? new Date('2024-01-01T00:00:00Z'),
    updatedAt: overrides.updatedAt ?? new Date('2024-01-01T00:00:00Z')
  });

  beforeEach(() => {
    service = {
      list: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn()
    } as unknown as jest.Mocked<TodosService>;

    controller = new TodosController(service);
  });

  it('lists todos through the service', async () => {
    const todos = [sampleTodo({ id: '1' }), sampleTodo({ id: '2', status: TodoStatus.COMPLETED })];
    service.list.mockResolvedValue(todos);
    const filter = { status: [TodoStatus.NEW, TodoStatus.COMPLETED] };

    const result = await controller.list(filter);

    expect(service.list).toHaveBeenCalledWith(filter);
    expect(result).toEqual(todos);
  });

  it('creates todos via the service', async () => {
    const payload = { title: 'Create me', description: 'Desc', status: TodoStatus.IN_PROGRESS };
    const created = sampleTodo({ id: 'created', ...payload });
    service.create.mockResolvedValue(created);

    const result = await controller.create(payload);

    expect(service.create).toHaveBeenCalledWith(payload);
    expect(result).toBe(created);
  });

  it('updates status via the service', async () => {
    const updated = sampleTodo({ status: TodoStatus.COMPLETED });
    service.updateStatus.mockResolvedValue(updated);

    const result = await controller.updateStatus('todo-id', { status: TodoStatus.COMPLETED });

    expect(service.updateStatus).toHaveBeenCalledWith('todo-id', { status: TodoStatus.COMPLETED });
    expect(result).toBe(updated);
  });
});
