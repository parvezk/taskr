import { cn } from '@/lib/utils';
import type { Tag } from '@/db/schema';

interface TagBadgeProps {
  tag: Pick<Tag, 'name' | 'color'>;
  className?: string;
}

export function TagBadge({ tag, className }: TagBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        className
      )}
      style={{
        backgroundColor: tag.color + '22',
        color: tag.color,
        border: `1px solid ${tag.color}44`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: tag.color }}
      />
      {tag.name}
    </span>
  );
}
