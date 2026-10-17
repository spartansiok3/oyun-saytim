import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'İntellektual Oyun | Bilik Yarışı',
  description: 'Azərbaycan dilində intellektual oyun sualları və bilik yarışları platforması',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="az" className="dark">
      <body className="min-h-screen bg-[#090d1a] text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white">
        {/* Header / Naviqasiya */}
        <header className="border-b border-indigo-950/60 bg-[#0c1222]/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-xl shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                🧠
              </span>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  İntellektual Oyun
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    AZ
                  </span>
                </h1>
                <p className="text-xs text-slate-400">Bilik və Məntiq Yarışı</p>
              </div>
            </a>
            <nav className="flex items-center gap-2 sm:gap-4">
              <a
                href="/"
                className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors"
              >
                Paketlər
              </a>
              <a
                href="/admin"
                className="text-xs sm:text-sm font-medium text-indigo-300 hover:text-white hover:bg-white/5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>⚙️</span> İnzibatçı
              </a>
            </nav>
          </div>
        </header>

        {/* Əsas hissə */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-indigo-950/60 bg-[#070a14] py-6 text-center text-xs text-slate-500">
          <p>© 2026 İntellektual Oyun Platforması. Bütün hüquqlar qorunur.</p>
        </footer>
      </body>
    </html>
  );
}
