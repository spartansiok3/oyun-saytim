import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import LoginForm from './LoginForm';

export const instant = false;

export const metadata = {
  title: 'İnzibatçı Girişi | İntellektual Oyun',
  description: 'İnzibatçı panelinə daxil olmaq üçün şifrə tələb olunur.',
};

export default async function AdminLoginPage() {
  const isAuthed = await isAuthenticated();
  if (isAuthed) {
    redirect('/admin');
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-8 p-8 rounded-3xl bg-[#0e1629]/95 border border-indigo-900/50 shadow-2xl backdrop-blur">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-950/70 border border-indigo-800/50 flex items-center justify-center text-3xl shadow-inner shadow-indigo-600/20">
            🔐
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            İnzibatçı Girişi
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Paketləri və sualları idarə etmək üçün sistemə daxil olun
          </p>
        </div>

        <LoginForm />

        <div className="pt-4 border-t border-indigo-950/80 text-center">
          <a
            href="/"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            ← Əsas səhifəyə qayıt
          </a>
        </div>
      </div>
    </div>
  );
}
