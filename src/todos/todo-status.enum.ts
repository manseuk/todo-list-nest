export enum TodoStatus {
  NEW = 'New',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed'
}

export const DEFAULT_VISIBLE_STATUSES: TodoStatus[] = [
  TodoStatus.NEW,
  TodoStatus.IN_PROGRESS
];
