import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('@/db', () => ({
  db: {
    query: {
      todos: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock Neon Auth
vi.mock('@neondatabase/auth/next/server', () => ({
  neonAuth: vi.fn(),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { db } from '@/db';
import { neonAuth } from '@neondatabase/auth/next/server';
import { revalidatePath } from 'next/cache';
import { getTodos, createTodo, updateTodo, deleteTodo, toggleTodo } from '@/actions/todos';

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const mockTodo = {
  id: 'todo-abc',
  userId: 'user-123',
  title: 'Test todo',
  description: null,
  done: false,
  dueDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  todoTags: [],
};

describe('Todo Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser, session: {} as never });
  });

  describe('getTodos', () => {
    it('fetches todos for authenticated user', async () => {
      vi.mocked(db.query.todos.findMany).mockResolvedValue([mockTodo]);

      const result = await getTodos();

      expect(db.query.todos.findMany).toHaveBeenCalledOnce();
      expect(result).toEqual([mockTodo]);
    });

    it('throws when user is not authenticated', async () => {
      vi.mocked(neonAuth).mockResolvedValue({ user: null, session: null });

      await expect(getTodos()).rejects.toThrow('Unauthorized');
    });
  });

  describe('createTodo', () => {
    it('creates a todo with valid data', async () => {
      const insertReturning = vi.fn().mockResolvedValue([mockTodo]);
      const insertValues = vi.fn().mockReturnValue({ returning: insertReturning });
      vi.mocked(db.insert).mockReturnValue({ values: insertValues } as never);

      const formData = new FormData();
      formData.set('title', 'New task');

      const result = await createTodo(formData);

      expect(db.insert).toHaveBeenCalledOnce();
      expect(result).toMatchObject({ success: true });
    });

    it('returns error for empty title', async () => {
      const formData = new FormData();
      formData.set('title', '');

      const result = await createTodo(formData);

      expect(result).toMatchObject({ error: expect.any(String) });
      expect(db.insert).not.toHaveBeenCalled();
    });

    it('throws when user is not authenticated', async () => {
      vi.mocked(neonAuth).mockResolvedValue({ user: null, session: null });

      const formData = new FormData();
      formData.set('title', 'New task');

      await expect(createTodo(formData)).rejects.toThrow('Unauthorized');
    });
  });

  describe('toggleTodo', () => {
    it('toggles a todo done status', async () => {
      vi.mocked(db.query.todos.findFirst).mockResolvedValue(mockTodo as never);

      const updateSet = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
      vi.mocked(db.update).mockReturnValue({ set: updateSet } as never);

      const result = await toggleTodo('todo-abc', true);

      expect(db.update).toHaveBeenCalledOnce();
      expect(revalidatePath).toHaveBeenCalledWith('/tasks');
      expect(result).toMatchObject({ success: true });
    });

    it('returns error when todo not found', async () => {
      vi.mocked(db.query.todos.findFirst).mockResolvedValue(undefined as never);

      const result = await toggleTodo('nonexistent', true);

      expect(result).toMatchObject({ error: 'Todo not found' });
      expect(db.update).not.toHaveBeenCalled();
    });

    it('returns error when todo belongs to different user', async () => {
      vi.mocked(db.query.todos.findFirst).mockResolvedValue(undefined as never);

      const result = await toggleTodo('todo-belonging-to-other-user', true);

      expect(result).toMatchObject({ error: 'Todo not found' });
    });
  });

  describe('deleteTodo', () => {
    it('deletes a todo', async () => {
      vi.mocked(db.query.todos.findFirst).mockResolvedValue(mockTodo as never);
      const deleteWhere = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.delete).mockReturnValue({ where: deleteWhere } as never);

      const result = await deleteTodo('todo-abc');

      expect(db.delete).toHaveBeenCalledOnce();
      expect(revalidatePath).toHaveBeenCalledWith('/tasks');
      expect(result).toMatchObject({ success: true });
    });

    it('returns error when todo not found', async () => {
      vi.mocked(db.query.todos.findFirst).mockResolvedValue(undefined as never);

      const result = await deleteTodo('nonexistent');

      expect(result).toMatchObject({ error: 'Todo not found' });
      expect(db.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateTodo', () => {
    it('updates a todo', async () => {
      vi.mocked(db.query.todos.findFirst).mockResolvedValue(mockTodo as never);

      const updateSet = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
      vi.mocked(db.update).mockReturnValue({ set: updateSet } as never);

      const deleteWhere = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.delete).mockReturnValue({ where: deleteWhere } as never);

      const formData = new FormData();
      formData.set('title', 'Updated title');

      const result = await updateTodo('todo-abc', formData);

      expect(db.update).toHaveBeenCalledOnce();
      expect(revalidatePath).toHaveBeenCalledWith('/tasks');
      expect(result).toMatchObject({ success: true });
    });
  });
});
