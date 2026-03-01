'use server';

import { revalidatePath } from 'next/cache';
import { neonAuth } from '@neondatabase/auth/next/server';
import { db } from '@/db';
import { todos, todoTags } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { z } from 'zod';

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  tagIds: z.array(z.string().uuid()).optional(),
});

async function requireUser() {
  const { user } = await neonAuth();
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function getTodos(filter?: { tagId?: string; done?: boolean }) {
  const user = await requireUser();

  const allTodos = await db.query.todos.findMany({
    where: (t, { eq, and }) => {
      const conditions = [eq(t.userId, user.id)];
      if (filter?.done !== undefined) conditions.push(eq(t.done, filter.done));
      return and(...conditions);
    },
    with: {
      todoTags: {
        with: { tag: true },
      },
    },
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  if (filter?.tagId) {
    return allTodos.filter((todo) => todo.todoTags.some((tt) => tt.tag.id === filter.tagId));
  }

  return allTodos;
}

export async function createTodo(formData: FormData) {
  const user = await requireUser();

  const raw = {
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || undefined,
    dueDate: (formData.get('dueDate') as string) || null,
    tagIds: formData.getAll('tagIds') as string[],
  };

  const parsed = todoSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const [todo] = await db
    .insert(todos)
    .values({
      userId: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    })
    .returning();

  if (parsed.data.tagIds && parsed.data.tagIds.length > 0) {
    const validTagIds = parsed.data.tagIds.filter(Boolean);
    if (validTagIds.length > 0) {
      await db.insert(todoTags).values(
        validTagIds.map((tagId) => ({
          todoId: todo.id,
          tagId,
        }))
      );
    }
  }

  revalidatePath('/tasks');
  return { success: true, todo };
}

export async function updateTodo(id: string, formData: FormData) {
  const user = await requireUser();

  const existing = await db.query.todos.findFirst({
    where: (t, { eq, and }) => and(eq(t.id, id), eq(t.userId, user.id)),
  });
  if (!existing) return { error: 'Todo not found' };

  const raw = {
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || undefined,
    dueDate: (formData.get('dueDate') as string) || null,
    tagIds: formData.getAll('tagIds') as string[],
  };

  const parsed = todoSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db
    .update(todos)
    .set({
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      updatedAt: new Date(),
    })
    .where(and(eq(todos.id, id), eq(todos.userId, user.id)));

  // Update tags: delete existing, insert new
  await db.delete(todoTags).where(eq(todoTags.todoId, id));
  const validTagIds = (parsed.data.tagIds || []).filter(Boolean);
  if (validTagIds.length > 0) {
    await db.insert(todoTags).values(
      validTagIds.map((tagId) => ({
        todoId: id,
        tagId,
      }))
    );
  }

  revalidatePath('/tasks');
  return { success: true };
}

export async function deleteTodo(id: string) {
  const user = await requireUser();

  const existing = await db.query.todos.findFirst({
    where: (t, { eq, and }) => and(eq(t.id, id), eq(t.userId, user.id)),
  });
  if (!existing) return { error: 'Todo not found' };

  await db.delete(todos).where(and(eq(todos.id, id), eq(todos.userId, user.id)));

  revalidatePath('/tasks');
  return { success: true };
}

export async function toggleTodo(id: string, done: boolean) {
  const user = await requireUser();

  const existing = await db.query.todos.findFirst({
    where: (t, { eq, and }) => and(eq(t.id, id), eq(t.userId, user.id)),
  });
  if (!existing) return { error: 'Todo not found' };

  await db
    .update(todos)
    .set({ done, updatedAt: new Date() })
    .where(and(eq(todos.id, id), eq(todos.userId, user.id)));

  revalidatePath('/tasks');
  return { success: true };
}

export async function bulkDeleteTodos(ids: string[]) {
  const user = await requireUser();

  await db
    .delete(todos)
    .where(and(eq(todos.userId, user.id), inArray(todos.id, ids)));

  revalidatePath('/tasks');
  return { success: true };
}
