'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/lib/actions';

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError('Zəhmət olmasa şifrəni daxil edin.');
      return;
    }

    startTransition(async () => {
      const res = await loginAction(password);
      if (res.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(res.error || 'Daxil edilən şifrə yalnışdır.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 text-sm flex items-start gap-2.5">
          <span className="text-red-400 text-base">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="admin-password"
          className="block text-sm font-semibold text-slate-300 mb-2"
        >
          İnzibatçı Şifrəsi
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Şifrənizi daxil edin"
          disabled={isPending}
          autoFocus
          className="w-full px-4 py-3 rounded-xl bg-[#080d1a] border border-indigo-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 transition-all disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-indigo-950/50 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Yoxlanılır...</span>
          </>
        ) : (
          <span>Daxil ol</span>
        )}
      </button>
    </form>
  );
}
