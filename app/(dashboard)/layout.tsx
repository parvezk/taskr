import type { ReactNode } from 'react';
import { Sidebar } from '@/components/nav/sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
