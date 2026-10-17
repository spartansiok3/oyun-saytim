'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createPackAction,
  togglePackStatusAction,
  deletePackAction,
} from '@/lib/actions';

export interface AdminPackItem {
  _id: string;
  ad: string;
  kateqoriya: string;
  aktiv: boolean;
  sualSayi: number;
  yaradilmaTarixi: string;
}

interface AdminPackListProps {
  packs: AdminPackItem[];
}

export default function AdminPackList({ packs }: AdminPackListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Yeni paket modalı vəziyyəti
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAd, setNewAd] = useState('');
  const [newKateqoriya, setNewKateqoriya] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Silmə təsdiq dialoqu
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCreatePack = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newAd.trim()) {
      setFormError('Paketin adını qeyd edin.');
      return;
    }

    startTransition(async () => {
      const res = await createPackAction({
        ad: newAd,
        kateqoriya: newKateqoriya,
      });

      if (res.success) {
        setIsModalOpen(false);
        setNewAd('');
        setNewKateqoriya('');
        router.refresh();
      } else {
        setFormError(res.error || 'Paket yaradılarkən xəta baş verdi.');
      }
    });
  };

  const handleToggle = (packId: string) => {
    setActionError(null);
    startTransition(async () => {
      const res = await togglePackStatusAction(packId);
      if (res.success) {
        router.refresh();
      } else {
        setActionError(res.error || 'Status dəyişdirilərkən xəta baş verdi.');
      }
    });
  };

  const handleDelete = (packId: string, packAd: string) => {
    setActionError(null);
    const confirmed = window.confirm(
      `"${packAd}" paketini və onun BÜTÜN suallarını silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarılmır!`
    );

    if (!confirmed) return;

    setDeletingId(packId);
    startTransition(async () => {
      const res = await deletePackAction(packId);
      setDeletingId(null);
      if (res.success) {
        router.refresh();
      } else {
        setActionError(res.error || 'Paket silinərkən xəta baş verdi.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Üst idarə paneli və "Yeni paket" düyməsi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sual Paketləri
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ümumi paket sayı: <span className="text-indigo-300 font-bold">{packs.length}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-950/40 active:scale-95 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <span>➕</span>
          <span>Yeni paket</span>
        </button>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 text-sm">
          {actionError}
        </div>
      )}

      {/* Paketlərin Cədvəli */}
      {packs.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[#0e1629]/80 border border-indigo-900/40 p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-950/70 border border-indigo-800/40 flex items-center justify-center text-3xl">
            📦
          </div>
          <h3 className="text-xl font-bold text-white">Hələ heç bir paket yoxdur</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mt-2">
            İntellektual oyun suallarını toplamaq üçün yuxarıdakı &quot;Yeni paket&quot; düyməsinə klikləyərək ilk paketinizi yaradın.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-indigo-900/40 bg-[#0e1629]/90 shadow-xl">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-indigo-950/80 bg-indigo-950/30 text-xs uppercase font-bold tracking-wider text-indigo-300">
                <th className="py-4 px-6">Paketin Adı</th>
                <th className="py-4 px-6">Kateqoriya</th>
                <th className="py-4 px-6 text-center">Sual Sayı</th>
                <th className="py-4 px-6 text-center">Vəziyyət</th>
                <th className="py-4 px-6">Yaradılma Tarixi</th>
                <th className="py-4 px-6 text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-950/60 text-sm">
              {packs.map((pack) => (
                <tr
                  key={pack._id}
                  className="hover:bg-indigo-950/20 transition-colors group"
                >
                  <td className="py-4 px-6 font-semibold text-white">
                    <Link
                      href={`/admin/paket/${pack._id}`}
                      className="hover:text-indigo-300 transition-colors"
                    >
                      {pack.ad}
                    </Link>
                  </td>

                  <td className="py-4 px-6">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/40">
                      {pack.kateqoriya}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-200">
                      <span>❓</span> {pack.sualSayi}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggle(pack._id)}
                      disabled={isPending}
                      title="Vəziyyəti dəyişmək üçün klikləyin"
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        pack.aktiv
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900/60'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          pack.aktiv ? 'bg-emerald-400' : 'bg-slate-500'
                        }`}
                      />
                      {pack.aktiv ? 'Aktiv' : 'Passiv'}
                    </button>
                  </td>

                  <td className="py-4 px-6 text-slate-400 text-xs">
                    {pack.yaradilmaTarixi}
                  </td>

                  <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                    <Link
                      href={`/admin/paket/${pack._id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-800/40 text-xs font-semibold transition-colors"
                    >
                      <span>📝</span> Sualları idarə et
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(pack._id, pack.ad)}
                      disabled={isPending && deletingId === pack._id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <span>🗑️</span>
                      <span>{deletingId === pack._id ? 'Silinir...' : 'Sil'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Yeni Paket Modalı */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-[#0e1629] border border-indigo-900/60 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-950">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>➕</span> Yeni Sual Paketi
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreatePack} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Paketin Adı <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={newAd}
                  onChange={(e) => setNewAd(e.target.value)}
                  placeholder="Məs: Azərbaycan Tarixi - Qızıl Dövrlər"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#080d1a] border border-indigo-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Kateqoriya
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={newKateqoriya}
                  onChange={(e) => setNewKateqoriya(e.target.value)}
                  placeholder="Məs: Tarix, Coğrafiya, İncəsənət və s."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#080d1a] border border-indigo-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-indigo-950">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-950/50 active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isPending ? 'Əlavə edilir...' : 'Paketi Yarat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
