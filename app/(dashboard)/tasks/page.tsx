import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { getTodos } from '@/actions/todos';
import { getTags } from '@/actions/tags';
import { TodoList } from '@/components/todos/todo-list';
import type { SearchParams } from '@/lib/types';

interface TasksPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams;
  const tagId = typeof params.tag === 'string' ? params.tag : undefined;
  const doneParam = typeof params.done === 'string' ? params.done : undefined;
  const done = doneParam === 'true' ? true : doneParam === 'false' ? false : undefined;

  const [todos, tags] = await Promise.all([
    getTodos({ tagId, done }),
    getTags(),
  ]);

  return (
    <Suspense>
      <TodoList todos={todos} tags={tags} />
    </Suspense>
  );
}
