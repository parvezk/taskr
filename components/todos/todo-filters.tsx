'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { TagBadge } from '@/components/tags/tag-badge';
import type { Tag } from '@/db/schema';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface TodoFiltersProps {
  tags: Tag[];
}

export function TodoFilters({ tags }: TodoFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTagId = searchParams.get('tag');
  const activeDone = searchParams.get('done');

  const setFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const hasFilters = activeTagId || activeDone;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Done filter */}
      <Button
        variant={activeDone === null ? 'secondary' : 'outline'}
        size="sm"
        onClick={() => setFilter('done', null)}
        className="h-7 text-xs"
      >
        All
      </Button>
      <Button
        variant={activeDone === 'false' ? 'secondary' : 'outline'}
        size="sm"
        onClick={() => setFilter('done', 'false')}
        className="h-7 text-xs"
      >
        Active
      </Button>
      <Button
        variant={activeDone === 'true' ? 'secondary' : 'outline'}
        size="sm"
        onClick={() => setFilter('done', 'true')}
        className="h-7 text-xs"
      >
        Completed
      </Button>

      {tags.length > 0 && (
        <>
          <span className="text-muted-foreground text-xs">|</span>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() =>
                setFilter('tag', activeTagId === tag.id ? null : tag.id)
              }
              className={cn(
                'rounded-full transition-opacity',
                activeTagId === tag.id ? 'opacity-100 ring-2 ring-offset-1 ring-ring' : 'opacity-70 hover:opacity-100'
              )}
            >
              <TagBadge tag={tag} />
            </button>
          ))}
        </>
      )}

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1 text-muted-foreground"
          onClick={() => {
            router.push(pathname);
          }}
        >
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
