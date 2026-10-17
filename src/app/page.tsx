import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import Pack from '@/models/Pack';
import Question from '@/models/Question';

export const instant = false;

interface PackItem {
  _id: string;
  ad: string;
  kateqoriya: string;
  sualSayi: number;
}

export default async function HomePage() {
  let packs: PackItem[] = [];
  let xetaMesaji: string | null = null;

  try {
    await connectToDatabase();

    const activePacks = await Pack.find({ aktiv: true })
      .sort({ yaradilmaTarixi: -1 })
      .lean();

    if (activePacks.length > 0) {
      const packIds = activePacks.map((p) => p._id);

      const counts = await Question.aggregate([
        { $match: { packId: { $in: packIds } } },
        { $group: { _id: '$packId', count: { $sum: 1 } } },
      ]);

      const countMap = new Map<string, number>(
        counts.map((c) => [c._id.toString(), c.count])
      );

      packs = activePacks.map((p) => ({
        _id: p._id.toString(),
        ad: p.ad,
        kateqoriya: p.kateqoriya || 'Ümumi',
        sualSayi: countMap.get(p._id.toString()) || 0,
      }));
    }
  } catch (error: unknown) {
    console.error('Baza oxunarkən xəta:', error);
    xetaMesaji =
      error instanceof Error ? error.message : 'Məlumat bazası ilə əlaqə qurularkən xəta baş verdi.';
  }

  return (
    <div className="space-y-10">
      {/* Başlıq bölməsi */}
      <section className="text-center space-y-3 pt-4 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-800/40 text-xs font-medium text-indigo-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Aktiv Oyun Paketləri
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
          İntellektual Sual Paketləri
        </h2>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300">
          İstədiyiniz paketi seçin, taymeri işə salın və intellektual yarışa başlayın.
        </p>
      </section>

      {/* Xəta baş verərsə */}
      {xetaMesaji && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-sm max-w-xl mx-auto text-center">
          <p className="font-semibold mb-1">Baza xətası baş verdi</p>
          <p className="text-red-300 text-xs">{xetaMesaji}</p>
        </div>
      )}

      {/* Paketlərin siyahısı */}
      {!xetaMesaji && packs.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-950/60 border border-indigo-900/40 flex items-center justify-center text-3xl text-indigo-400">
            📦
          </div>
          <h3 className="text-xl font-bold text-slate-200">Hələ paket yoxdur</h3>
          <p className="text-slate-400 text-sm mt-2">
            Hal-hazırda aktiv sual paketi mövcud deyil. Tezliklə yeni paketlər əlavə olunacaq.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs.map((pack) => (
            <Link
              key={pack._id}
              href={`/paket/${pack._id}`}
              className="group relative flex flex-col justify-between rounded-2xl bg-[#0e1629]/90 border border-indigo-900/40 hover:border-indigo-500/70 p-6 shadow-xl hover:shadow-2xl hover:shadow-indigo-950/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/40">
                    {pack.kateqoriya}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-indigo-300 bg-indigo-950/50 px-2.5 py-1 rounded-lg border border-indigo-800/30">
                    <span>❓</span> {pack.sualSayi} sual
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-indigo-200 transition-colors leading-snug">
                  {pack.ad}
                </h3>
              </div>

              <div className="mt-6 pt-4 border-t border-indigo-950 flex items-center justify-between text-sm font-semibold text-indigo-400 group-hover:text-indigo-300">
                <span>Oyuna başla</span>
                <span className="text-base group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
