'use client';

import { useState } from 'react';
import { Plus, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TodoItem } from './todo-item';
import { TodoFilters } from './todo-filters';
import { TodoForm } from './todo-form';
import type { Tag, TodoWithTags } from '@/db/schema';

interface TodoListProps {
  todos: TodoWithTags[];
  tags: Tag[];
}

export function TodoList({ todos, tags }: TodoListProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">My Tasks</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {todos.length} {todos.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add task
          </Button>
        </div>

        {/* Filters */}
        <TodoFilters tags={tags} />

        {/* List */}
        <Card>
          <CardHeader className="sr-only">
            <span>Tasks</span>
          </CardHeader>
          <CardContent className="p-0">
            {todos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <ClipboardList className="h-10 w-10 opacity-30" />
                <p className="text-sm font-medium">No tasks yet</p>
                <p className="text-xs">Add a task to get started</p>
              </div>
            ) : (
              <ul className="px-4">
                {todos.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} availableTags={tags} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <TodoForm open={createOpen} onClose={() => setCreateOpen(false)} availableTags={tags} />
    </>
  );
}
