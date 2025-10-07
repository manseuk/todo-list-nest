import { NotFoundException } from '@nestjs/common';
import { FindOperator, Repository } from 'typeorm';
import { DEFAULT_VISIBLE_STATUSES, TodoStatus } from './todo-status.enum';
import { TodoEntity } from './todo.entity';
import { TodosService } from './todos.service';

describe('TodosService', () => {
  let repository: jest.Mocked<Repository<TodoEntity>>;
  let service: TodosService;

  const buildTodo = (overrides: Partial<TodoEntity> = {}): TodoEntity => ({
    id: overrides.id ?? 'todo-id',
    title: overrides.title ?? 'Test todo',
    description: overrides.description ?? 'Description',
    status: overrides.status ?? TodoStatus.NEW,
    createdAt: overrides.createdAt ?? new Date('2024-01-01T00:00:00Z'),
    updatedAt: overrides.updatedAt ?? new Date('2024-01-01T00:00:00Z')
  });

  beforeEach(() => {
    repository = {
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn()
    } as unknown as jest.Mocked<Repository<TodoEntity>>;

    service = new TodosService(repository);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('list', () => {
    it('passes provided statuses to the repository query', async () => {
      const todos = [buildTodo({ id: 'a' }), buildTodo({ id: 'b', status: TodoStatus.COMPLETED })];
      repository.find.mockResolvedValue(todos);
      const filter = { status: [TodoStatus.COMPLETED] };
      const result = await service.list(filter);

      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { createdAt: 'DESC' },
          where: expect.objectContaining({ status: expect.any(Object) })
        })
      );

      const [[options]] = repository.find.mock.calls as Array<
        [
          {
            where: { status: FindOperator<TodoStatus> };
            order: { createdAt: string };
          }
        ]
      >;

      expect(options.order).toEqual({ createdAt: 'DESC' });
      expect(options.where.status.value).toEqual(filter.status);
      expect(result).toEqual(todos);
    });

    it('defaults to the visible statuses when none provided', async () => {
      repository.find.mockResolvedValue([]);

      await service.list({});

      const [[options]] = repository.find.mock.calls as Array<
        [
          {
            where: { status: FindOperator<TodoStatus> };
          }
        ]
      >;

      expect(options.where.status.value).toEqual(DEFAULT_VISIBLE_STATUSES);
    });
  });

  describe('create', () => {
    it('creates and saves the entity', async () => {
      const dto = { title: 'New todo', description: 'A description', status: TodoStatus.IN_PROGRESS };
      const entity = buildTodo({ ...dto, id: 'created-id' });
      repository.create.mockReturnValue(entity);
      repository.save.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith({
        title: dto.title,
        description: dto.description,
        status: dto.status
      });
      expect(repository.save).toHaveBeenCalledWith(entity);
      expect(result).toBe(entity);
    });

    it('defaults status when the dto omits it', async () => {
      const dto = { title: 'New todo' };
      const entity = buildTodo({ id: 'generated', description: null, status: TodoStatus.NEW });
      repository.create.mockReturnValue(entity);
      repository.save.mockResolvedValue(entity);

      await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith({
        title: dto.title,
        description: null,
        status: TodoStatus.NEW
      });
    });
  });

  describe('updateStatus', () => {
    it('updates an existing todo', async () => {
      const stored = buildTodo({ id: 'update-id', status: TodoStatus.NEW });
      repository.findOne.mockResolvedValue(stored);
      repository.save.mockImplementation(async (todo) => todo as TodoEntity);

      const result = await service.updateStatus('update-id', { status: TodoStatus.COMPLETED });

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'update-id' } });
      expect(repository.save).toHaveBeenCalledWith(stored);
      expect(result.status).toBe(TodoStatus.COMPLETED);
    });

    it('throws when the todo does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.updateStatus('missing', { status: TodoStatus.NEW })).rejects.toBeInstanceOf(
        NotFoundException
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
