'use client';

import { NeonAuthUIProvider } from '@neondatabase/auth/react/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { authClient } from '@/lib/auth-client';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={router.push}
      social={{
        providers: ['github'],
      }}
      redirectTo="/tasks"
      Link={Link}
    >
      <TooltipProvider>{children}</TooltipProvider>
    </NeonAuthUIProvider>
  );
}
