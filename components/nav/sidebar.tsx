'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare, Tag, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from './user-menu';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { href: '/tasks', label: 'My Tasks', icon: ListTodo },
  { href: '/tags', label: 'Tags', icon: Tag },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col h-full w-64 border-r bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b">
        <CheckSquare className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">Taskr</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* User menu at bottom */}
      <div className="p-3">
        <UserMenu />
      </div>
    </aside>
  );
}
