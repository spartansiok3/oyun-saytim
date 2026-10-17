'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/lib/actions';

export default function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.push('/admin/giris');
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="px-3.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 hover:text-red-200 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
    >
      <span>🚪</span>
      <span>{isPending ? 'Çıxılır...' : 'Çıxış'}</span>
    </button>
  );
}
