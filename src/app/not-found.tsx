import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-24 text-center max-w-md mx-auto space-y-5">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-950/70 border border-indigo-900/50 flex items-center justify-center text-3xl">
        🔍
      </div>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
        Səhifə və ya paket tapılmadı
      </h2>
      <p className="text-slate-400 text-sm">
        Axtardığınız sual paketi mövcud deyil və ya silinmiş ola bilər.
      </p>
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-950/40"
        >
          ← Ana səhifəyə qayıt
        </Link>
      </div>
    </div>
  );
}
