import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('@/db', () => ({
  db: {
    query: {
      tags: {
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
import { getTags, createTag, updateTag, deleteTag } from '@/actions/tags';

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const mockTag = {
  id: 'tag-xyz',
  userId: 'user-123',
  name: 'Work',
  color: '#6366f1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Tag Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser, session: {} as never });
  });

  describe('getTags', () => {
    it('fetches tags for authenticated user', async () => {
      vi.mocked(db.query.tags.findMany).mockResolvedValue([mockTag]);

      const result = await getTags();

      expect(db.query.tags.findMany).toHaveBeenCalledOnce();
      expect(result).toEqual([mockTag]);
    });

    it('throws when user is not authenticated', async () => {
      vi.mocked(neonAuth).mockResolvedValue({ user: null, session: null });

      await expect(getTags()).rejects.toThrow('Unauthorized');
    });
  });

  describe('createTag', () => {
    it('creates a tag with valid data', async () => {
      const insertReturning = vi.fn().mockResolvedValue([mockTag]);
      const insertValues = vi.fn().mockReturnValue({ returning: insertReturning });
      vi.mocked(db.insert).mockReturnValue({ values: insertValues } as never);

      const formData = new FormData();
      formData.set('name', 'Work');
      formData.set('color', '#6366f1');

      const result = await createTag(formData);

      expect(db.insert).toHaveBeenCalledOnce();
      expect(result).toMatchObject({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith('/tasks');
      expect(revalidatePath).toHaveBeenCalledWith('/tags');
    });

    it('returns error for empty name', async () => {
      const formData = new FormData();
      formData.set('name', '');
      formData.set('color', '#6366f1');

      const result = await createTag(formData);

      expect(result).toMatchObject({ error: expect.any(String) });
      expect(db.insert).not.toHaveBeenCalled();
    });

    it('returns error for invalid color', async () => {
      const formData = new FormData();
      formData.set('name', 'Work');
      formData.set('color', 'not-a-color');

      const result = await createTag(formData);

      expect(result).toMatchObject({ error: expect.any(String) });
      expect(db.insert).not.toHaveBeenCalled();
    });

    it('throws when user is not authenticated', async () => {
      vi.mocked(neonAuth).mockResolvedValue({ user: null, session: null });

      const formData = new FormData();
      formData.set('name', 'Work');

      await expect(createTag(formData)).rejects.toThrow('Unauthorized');
    });
  });

  describe('deleteTag', () => {
    it('deletes a tag', async () => {
      vi.mocked(db.query.tags.findFirst).mockResolvedValue(mockTag as never);
      const deleteWhere = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.delete).mockReturnValue({ where: deleteWhere } as never);

      const result = await deleteTag('tag-xyz');

      expect(db.delete).toHaveBeenCalledOnce();
      expect(revalidatePath).toHaveBeenCalledWith('/tasks');
      expect(result).toMatchObject({ success: true });
    });

    it('returns error when tag not found', async () => {
      vi.mocked(db.query.tags.findFirst).mockResolvedValue(undefined as never);

      const result = await deleteTag('nonexistent');

      expect(result).toMatchObject({ error: 'Tag not found' });
      expect(db.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateTag', () => {
    it('updates a tag', async () => {
      vi.mocked(db.query.tags.findFirst).mockResolvedValue(mockTag as never);

      const updateSet = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
      vi.mocked(db.update).mockReturnValue({ set: updateSet } as never);

      const formData = new FormData();
      formData.set('name', 'Updated Work');
      formData.set('color', '#ec4899');

      const result = await updateTag('tag-xyz', formData);

      expect(db.update).toHaveBeenCalledOnce();
      expect(revalidatePath).toHaveBeenCalledWith('/tags');
      expect(result).toMatchObject({ success: true });
    });

    it('returns error when tag not found', async () => {
      vi.mocked(db.query.tags.findFirst).mockResolvedValue(undefined as never);

      const formData = new FormData();
      formData.set('name', 'Work');
      formData.set('color', '#6366f1');

      const result = await updateTag('nonexistent', formData);

      expect(result).toMatchObject({ error: 'Tag not found' });
    });
  });
});
