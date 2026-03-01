'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createTodo, updateTodo } from '@/actions/todos';
import { TagBadge } from '@/components/tags/tag-badge';
import type { Tag, TodoWithTags } from '@/db/schema';
import { Loader2, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface TodoFormProps {
  open: boolean;
  onClose: () => void;
  todo?: TodoWithTags;
  availableTags: Tag[];
}

export function TodoForm({ open, onClose, todo, availableTags }: TodoFormProps) {
  const isEdit = !!todo;
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    todo?.todoTags.map((tt) => tt.tag.id) ?? []
  );
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    selectedTagIds.forEach((id) => formData.append('tagIds', id));

    startTransition(async () => {
      const result = isEdit
        ? await updateTodo(todo.id, formData)
        : await createTodo(formData);

      if ('error' in result && result.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  const selectedTags = availableTags.filter((t) => selectedTagIds.includes(t.id));

  // Format due date for input[type=date]
  const defaultDueDate = todo?.dueDate
    ? new Date(todo.dueDate).toISOString().split('T')[0]
    : '';

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit task' : 'New task'}</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="todo-title">Title</Label>
            <Input
              id="todo-title"
              name="title"
              placeholder="What needs to be done?"
              defaultValue={todo?.title}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="todo-description">Description (optional)</Label>
            <Textarea
              id="todo-description"
              name="description"
              placeholder="Add details..."
              defaultValue={todo?.description ?? ''}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="todo-due-date">Due date (optional)</Label>
            <Input
              id="todo-due-date"
              name="dueDate"
              type="date"
              defaultValue={defaultDueDate}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            {availableTags.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No tags yet. Create tags in the Tags page.
              </p>
            ) : (
              <Popover open={tagPickerOpen} onOpenChange={setTagPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-auto min-h-9 flex-wrap gap-1 py-1.5"
                  >
                    {selectedTags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedTags.map((t) => (
                          <TagBadge key={t.id} tag={t} />
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground font-normal">Select tags...</span>
                    )}
                    <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0">
                  <Command>
                    <CommandInput placeholder="Search tags..." />
                    <CommandList>
                      <CommandEmpty>No tags found.</CommandEmpty>
                      <CommandGroup>
                        {availableTags.map((tag) => (
                          <CommandItem
                            key={tag.id}
                            value={tag.name}
                            onSelect={() => toggleTag(tag.id)}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedTagIds.includes(tag.id) ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <TagBadge tag={tag} />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Save changes' : 'Add task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
