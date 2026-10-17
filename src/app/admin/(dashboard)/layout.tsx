import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import LogoutButton from './LogoutButton';

export const instant = false;

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthed = await isAuthenticated();
  if (!isAuthed) {
    redirect('/admin/giris');
  }

  return (
    <div className="space-y-6">
      {/* İnzibatçı idarəetmə başlığı */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0c1222]/90 border border-indigo-900/50 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-lg">
            ⚙️
          </span>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              İnzibatçı Paneli
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Aktiv
              </span>
            </h2>
            <p className="text-xs text-slate-400">Paketlərin və sualların idarə edilməsi</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/40 transition-colors"
          >
            📦 Paketlər
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            🌐 Sayta bax
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* Səhifə məzmunu */}
      <div>{children}</div>
    </div>
  );
}
