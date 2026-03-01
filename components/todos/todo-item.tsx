'use client';

import { useState, useTransition } from 'react';
import { Pencil, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TagBadge } from '@/components/tags/tag-badge';
import { TodoForm } from './todo-form';
import { toggleTodo, deleteTodo } from '@/actions/todos';
import type { Tag, TodoWithTags } from '@/db/schema';
import { cn } from '@/lib/utils';
import { format, isPast, isToday } from 'date-fns';

interface TodoItemProps {
  todo: TodoWithTags;
  availableTags: Tag[];
}

export function TodoItem({ todo, availableTags }: TodoItemProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      await toggleTodo(todo.id, checked);
    });
  }

  async function handleDelete() {
    await deleteTodo(todo.id);
    setDeleteOpen(false);
  }

  const dueDateObj = todo.dueDate ? new Date(todo.dueDate) : null;
  const isOverdue = dueDateObj && !todo.done && isPast(dueDateObj) && !isToday(dueDateObj);

  return (
    <>
      <li className="group flex items-start gap-3 py-3 border-b last:border-b-0">
        <div className="mt-0.5">
          <Checkbox
            checked={todo.done}
            onCheckedChange={handleToggle}
            disabled={isPending}
            aria-label={`Mark "${todo.title}" as ${todo.done ? 'incomplete' : 'complete'}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm font-medium break-words',
              todo.done && 'line-through text-muted-foreground'
            )}
          >
            {todo.title}
          </p>

          {todo.description && (
            <p className="text-xs text-muted-foreground mt-0.5 break-words">{todo.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {dueDateObj && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs',
                  isOverdue ? 'text-destructive' : 'text-muted-foreground'
                )}
              >
                <Calendar className="h-3 w-3" />
                {isToday(dueDateObj) ? 'Today' : format(dueDateObj, 'MMM d')}
              </span>
            )}

            {todo.todoTags.map(({ tag }) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </li>

      <TodoForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        todo={todo}
        availableTags={availableTags}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{todo.title}&rdquo; will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
