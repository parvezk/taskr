'use server';

import { revalidatePath } from 'next/cache';
import { neonAuth } from '@neondatabase/auth/next/server';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const tagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color')
    .default('#6366f1'),
});

async function requireUser() {
  const { user } = await neonAuth();
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function getTags() {
  const user = await requireUser();

  return db.query.tags.findMany({
    where: (t, { eq }) => eq(t.userId, user.id),
    orderBy: (t, { asc }) => [asc(t.name)],
  });
}

export async function createTag(formData: FormData) {
  const user = await requireUser();

  const raw = {
    name: formData.get('name') as string,
    color: (formData.get('color') as string) || '#6366f1',
  };

  const parsed = tagSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const [tag] = await db
    .insert(tags)
    .values({
      userId: user.id,
      name: parsed.data.name,
      color: parsed.data.color,
    })
    .returning();

  revalidatePath('/tasks');
  revalidatePath('/tags');
  return { success: true, tag };
}

export async function updateTag(id: string, formData: FormData) {
  const user = await requireUser();

  const existing = await db.query.tags.findFirst({
    where: (t, { eq, and }) => and(eq(t.id, id), eq(t.userId, user.id)),
  });
  if (!existing) return { error: 'Tag not found' };

  const raw = {
    name: formData.get('name') as string,
    color: (formData.get('color') as string) || existing.color,
  };

  const parsed = tagSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db
    .update(tags)
    .set({
      name: parsed.data.name,
      color: parsed.data.color,
      updatedAt: new Date(),
    })
    .where(and(eq(tags.id, id), eq(tags.userId, user.id)));

  revalidatePath('/tasks');
  revalidatePath('/tags');
  return { success: true };
}

export async function deleteTag(id: string) {
  const user = await requireUser();

  const existing = await db.query.tags.findFirst({
    where: (t, { eq, and }) => and(eq(t.id, id), eq(t.userId, user.id)),
  });
  if (!existing) return { error: 'Tag not found' };

  await db.delete(tags).where(and(eq(tags.id, id), eq(tags.userId, user.id)));

  revalidatePath('/tasks');
  revalidatePath('/tags');
  return { success: true };
}
