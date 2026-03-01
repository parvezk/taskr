import { describe, it, expect } from 'vitest';
import { todos, tags, todoTags, todosRelations, tagsRelations, todoTagsRelations } from '@/db/schema';
import { getTableName } from 'drizzle-orm';

describe('Database Schema', () => {
  describe('todos table', () => {
    it('has correct table name', () => {
      expect(getTableName(todos)).toBe('todos');
    });

    it('has all required columns', () => {
      const columns = Object.keys(todos);
      expect(columns).toContain('id');
      expect(columns).toContain('userId');
      expect(columns).toContain('title');
      expect(columns).toContain('done');
      expect(columns).toContain('createdAt');
      expect(columns).toContain('updatedAt');
    });

    it('has optional columns', () => {
      const columns = Object.keys(todos);
      expect(columns).toContain('description');
      expect(columns).toContain('dueDate');
    });
  });

  describe('tags table', () => {
    it('has correct table name', () => {
      expect(getTableName(tags)).toBe('tags');
    });

    it('has all required columns', () => {
      const columns = Object.keys(tags);
      expect(columns).toContain('id');
      expect(columns).toContain('userId');
      expect(columns).toContain('name');
      expect(columns).toContain('color');
    });
  });

  describe('todo_tags junction table', () => {
    it('has correct table name', () => {
      expect(getTableName(todoTags)).toBe('todo_tags');
    });

    it('has foreign key columns', () => {
      const columns = Object.keys(todoTags);
      expect(columns).toContain('todoId');
      expect(columns).toContain('tagId');
    });
  });

  describe('relations', () => {
    it('todos has todoTags relation', () => {
      expect(todosRelations).toBeDefined();
    });

    it('tags has todoTags relation', () => {
      expect(tagsRelations).toBeDefined();
    });

    it('todoTags has todo and tag relations', () => {
      expect(todoTagsRelations).toBeDefined();
    });
  });
});
