'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { TagBadge } from './tag-badge';
import { TagForm } from './tag-form';
import { deleteTag } from '@/actions/tags';
import type { Tag } from '@/db/schema';

interface TagListProps {
  tags: Tag[];
}

export function TagList({ tags }: TagListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | undefined>(undefined);
  const [deletingTag, setDeletingTag] = useState<Tag | undefined>(undefined);

  function handleEdit(tag: Tag) {
    setEditingTag(tag);
    setFormOpen(true);
  }

  function handleFormClose() {
    setFormOpen(false);
    setEditingTag(undefined);
  }

  async function handleDelete() {
    if (!deletingTag) return;
    await deleteTag(deletingTag.id);
    setDeletingTag(undefined);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base">Your Tags</CardTitle>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Tag
          </Button>
        </CardHeader>
        <CardContent>
          {tags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No tags yet.</p>
              <p className="text-xs mt-1">Create tags to organise your todos.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {tags.map((tag) => (
                <li key={tag.id} className="flex items-center justify-between py-3">
                  <TagBadge tag={tag} />
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(tag)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit {tag.name}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeletingTag(tag)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete {tag.name}</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <TagForm open={formOpen} onClose={handleFormClose} tag={editingTag} />

      <AlertDialog open={!!deletingTag} onOpenChange={(o) => !o && setDeletingTag(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tag &ldquo;{deletingTag?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the tag from all todos. This action cannot be undone.
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
