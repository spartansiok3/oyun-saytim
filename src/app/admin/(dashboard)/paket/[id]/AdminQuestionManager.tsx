'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  updatePackAction,
  createQuestionAction,
  updateQuestionAction,
  deleteQuestionAction,
} from '@/lib/actions';

export interface AdminQuestionItem {
  _id: string;
  sira: number;
  sual: string;
  cavab: string;
  qeyd?: string;
  vaxt: number;
}

export interface AdminPackDetail {
  _id: string;
  ad: string;
  kateqoriya: string;
  aktiv: boolean;
}

interface AdminQuestionManagerProps {
  pack: AdminPackDetail;
  questions: AdminQuestionItem[];
}

export default function AdminQuestionManager({
  pack,
  questions,
}: AdminQuestionManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Paket məlumatlarını redaktə etmə vəziyyəti
  const [isEditingPack, setIsEditingPack] = useState(false);
  const [packAd, setPackAd] = useState(pack.ad);
  const [packKateqoriya, setPackKateqoriya] = useState(pack.kateqoriya);
  const [packError, setPackError] = useState<string | null>(null);

  // Yeni sual forması vəziyyəti
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newSual, setNewSual] = useState('');
  const [newCavab, setNewCavab] = useState('');
  const [newQeyd, setNewQeyd] = useState('');
  const [newVaxt, setNewVaxt] = useState(60);
  const [addError, setAddError] = useState<string | null>(null);

  // Sual redaktə modalı vəziyyəti
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestionItem | null>(null);
  const [editSual, setEditSual] = useState('');
  const [editCavab, setEditCavab] = useState('');
  const [editQeyd, setEditQeyd] = useState('');
  const [editVaxt, setEditVaxt] = useState(60);
  const [editSira, setEditSira] = useState(1);
  const [editError, setEditError] = useState<string | null>(null);

  // Silmə və ümumi xətalar
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);

  // Paket məlumatlarını yeniləmək
  const handleUpdatePack = async (e: React.FormEvent) => {
    e.preventDefault();
    setPackError(null);

    if (!packAd.trim()) {
      setPackError('Paketin adı boş ola bilməz.');
      return;
    }

    startTransition(async () => {
      const res = await updatePackAction(pack._id, {
        ad: packAd,
        kateqoriya: packKateqoriya,
      });

      if (res.success) {
        setIsEditingPack(false);
        router.refresh();
      } else {
        setPackError(res.error || 'Paket məlumatları yenilənmədi.');
      }
    });
  };

  // Yeni sual əlavə etmək
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    if (!newSual.trim()) {
      setAddError('Sual mətni daxil edilməlidir.');
      return;
    }
    if (!newCavab.trim()) {
      setAddError('Cavab mətni daxil edilməlidir.');
      return;
    }

    startTransition(async () => {
      const res = await createQuestionAction(pack._id, {
        sual: newSual,
        cavab: newCavab,
        qeyd: newQeyd,
        vaxt: newVaxt,
      });

      if (res.success) {
        setIsAddingQuestion(false);
        setNewSual('');
        setNewCavab('');
        setNewQeyd('');
        setNewVaxt(60);
        router.refresh();
      } else {
        setAddError(res.error || 'Sual əlavə edilərkən xəta baş verdi.');
      }
    });
  };

  // Sual redaktəsini açmaq
  const openEditQuestionModal = (q: AdminQuestionItem) => {
    setEditingQuestion(q);
    setEditSual(q.sual);
    setEditCavab(q.cavab);
    setEditQeyd(q.qeyd || '');
    setEditVaxt(q.vaxt || 60);
    setEditSira(q.sira || 1);
    setEditError(null);
  };

  // Sual redaktəsini yadda saxlamaq
  const handleSaveEditQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    setEditError(null);

    if (!editSual.trim()) {
      setEditError('Sual mətni daxil edilməlidir.');
      return;
    }
    if (!editCavab.trim()) {
      setEditError('Cavab mətni daxil edilməlidir.');
      return;
    }

    startTransition(async () => {
      const res = await updateQuestionAction(editingQuestion._id, pack._id, {
        sual: editSual,
        cavab: editCavab,
        qeyd: editQeyd,
        vaxt: editVaxt,
        sira: editSira,
      });

      if (res.success) {
        setEditingQuestion(null);
        router.refresh();
      } else {
        setEditError(res.error || 'Sual yenilənərkən xəta baş verdi.');
      }
    });
  };

  // Sual silmək
  const handleDeleteQuestion = (questionId: string, sira: number) => {
    setActionError(null);
    const confirmed = window.confirm(
      `Sual #${sira}-ni silmək istədiyinizə əminsiniz?`
    );
    if (!confirmed) return;

    setDeletingQuestionId(questionId);
    startTransition(async () => {
      const res = await deleteQuestionAction(questionId, pack._id);
      setDeletingQuestionId(null);
      if (res.success) {
        router.refresh();
      } else {
        setActionError(res.error || 'Sual silinərkən xəta baş verdi.');
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Üst naviqasiya və paket detalları */}
      <div className="space-y-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-300 hover:text-white transition-colors"
        >
          <span>←</span> Bütün paketlərə qayıt
        </Link>

        {/* Paketin başlıq kartı */}
        <div className="p-6 rounded-3xl bg-[#0e1629] border border-indigo-900/50 shadow-xl space-y-4">
          {!isEditingPack ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/70 text-purple-300 border border-purple-800/40">
                    {pack.kateqoriya}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      pack.aktiv
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {pack.aktiv ? 'Aktiv' : 'Passiv'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {pack.ad}
                </h1>
                <p className="text-xs text-slate-400">
                  Cəmi sual sayı: <span className="font-bold text-indigo-300">{questions.length}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPackAd(pack.ad);
                    setPackKateqoriya(pack.kateqoriya);
                    setPackError(null);
                    setIsEditingPack(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>✏️</span> Paketi Redaktə Et
                </button>

                <Link
                  href={`/paket/${pack._id}`}
                  target="_blank"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/40 transition-colors flex items-center gap-1.5"
                >
                  <span>🎮</span> Oyuna bax
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdatePack} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-950">
                <h3 className="text-base font-bold text-white">Paket Məlumatlarını Redaktə Et</h3>
                <button
                  type="button"
                  onClick={() => setIsEditingPack(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {packError && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 text-xs">
                  {packError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Paketin Adı <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={200}
                    value={packAd}
                    onChange={(e) => setPackAd(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080d1a] border border-indigo-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Kateqoriya
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={packKateqoriya}
                    onChange={(e) => setPackKateqoriya(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080d1a] border border-indigo-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingPack(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isPending ? 'Yadda saxlanılır...' : 'Yadda Saxla'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 text-sm">
          {actionError}
        </div>
      )}

      {/* Sualların siyahısı və "Yeni sual" bölməsi */}
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Suallar Siyahısı
            </h2>
            <p className="text-xs text-slate-400">
              Suallar ardıcıl olaraq nömrələnir və göstərilir
            </p>
          </div>

          {!isAddingQuestion && (
            <button
              type="button"
              onClick={() => {
                setAddError(null);
                setIsAddingQuestion(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/40 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>➕</span>
              <span>Yeni sual əlavə et</span>
            </button>
          )}
        </div>

        {/* Yeni Sual Əlavə Etmə Forması */}
        {isAddingQuestion && (
          <div className="rounded-3xl bg-[#0e1629] border border-emerald-900/40 p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-950">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-emerald-400">➕</span> Yeni Sual Əlavə Et
                <span className="text-xs text-slate-400 font-normal">
                  (Sıra nömrəsi #{questions.length + 1} olacaq)
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingQuestion(false)}
                className="text-slate-400 hover:text-white text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            {addError && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 text-sm">
                {addError}
              </div>
            )}

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Sual Mətni <span className="text-red-400">*</span>{' '}
                  <span className="text-[11px] text-slate-500 font-normal">
                    (Maksimum 1000 simvol)
                  </span>
                </label>
                <textarea
                  required
                  rows={3}
                  maxLength={1000}
                  value={newSual}
                  onChange={(e) => setNewSual(e.target.value)}
                  placeholder="Sualın mətnini qeyd edin..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#080d1a] border border-indigo-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Cavab <span className="text-red-400">*</span>{' '}
                    <span className="text-[11px] text-slate-500 font-normal">
                      (Maksimum 500 simvol)
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={500}
                    value={newCavab}
                    onChange={(e) => setNewCavab(e.target.value)}
                    placeholder="Düzgün cavabı daxil edin..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#080d1a] border border-indigo-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Vaxt (saniyə) <span className="text-red-400">*</span>{' '}
                    <span className="text-[11px] text-slate-500 font-normal">
                      (5 - 600 saniyə, default: 60)
                    </span>
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={600}
                    value={newVaxt}
                    onChange={(e) => setNewVaxt(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#080d1a] border border-indigo-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Əlavə Qeyd{' '}
                  <span className="text-[11px] text-slate-500 font-normal">
                    (Məcburi deyil, maksimum 500 simvol)
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={500}
                  value={newQeyd}
                  onChange={(e) => setNewQeyd(e.target.value)}
                  placeholder="İzah və ya tarixi məlumat..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#080d1a] border border-indigo-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-indigo-950">
                <button
                  type="button"
                  onClick={() => setIsAddingQuestion(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? 'Əlavə edilir...' : 'Sualı Yadda Saxla'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Suallar siyahısı kartları */}
        {questions.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-[#0e1629]/70 border border-indigo-900/40 p-8">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-2xl">
              ❓
            </div>
            <h3 className="text-lg font-bold text-white">Bu paketdə hələ sual yoxdur</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
              Yuxarıdakı &quot;Yeni sual əlavə et&quot; düyməsinə klikləyərək paketin ilk sualını daxil edin.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div
                key={q._id}
                className="p-5 sm:p-6 rounded-2xl bg-[#0e1629]/90 border border-indigo-900/40 hover:border-indigo-800/60 transition-all space-y-4 shadow-lg group"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                      Sual #{q.sira}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-amber-950/40 text-amber-300 border border-amber-800/40 text-xs font-semibold flex items-center gap-1">
                      <span>⏱️</span> {q.vaxt} san
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditQuestionModal(q)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-800/40 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>✏️</span> Redaktə
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q._id, q.sira)}
                      disabled={isPending && deletingQuestionId === q._id}
                      className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    >
                      <span>🗑️</span>
                      <span>{deletingQuestionId === q._id ? 'Silinir...' : 'Sil'}</span>
                    </button>
                  </div>
                </div>

                {/* Sual mətni */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                    {q.sual}
                  </h3>
                </div>

                {/* Cavab və qeyd */}
                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-900/30 space-y-1.5 text-xs sm:text-sm">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-emerald-400 uppercase text-[11px] tracking-wide shrink-0">
                      Cavab:
                    </span>
                    <span className="text-slate-100 font-semibold">{q.cavab}</span>
                  </div>
                  {q.qeyd && (
                    <div className="flex items-baseline gap-2 pt-1 border-t border-indigo-950/80 text-slate-300">
                      <span className="font-semibold text-indigo-300 uppercase text-[10px] tracking-wide shrink-0">
                        Qeyd:
                      </span>
                      <span className="italic">{q.qeyd}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sual Redaktə Modalı */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl rounded-3xl bg-[#0e1629] border border-indigo-900/60 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-950">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>✏️</span> Sualı Redaktə Et
              </h3>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="text-slate-400 hover:text-white text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            {editError && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 text-sm">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEditQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Sual Mətni <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  maxLength={1000}
                  value={editSual}
                  onChange={(e) => setEditSual(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#080d1a] border border-indigo-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Cavab <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={500}
                  value={editCavab}
                  onChange={(e) => setEditCavab(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#080d1a] border border-indigo-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Vaxt (saniyə) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={600}
                    value={editVaxt}
                    onChange={(e) => setEditVaxt(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#080d1a] border border-indigo-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Sıra Nömrəsi
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editSira}
                    onChange={(e) => setEditSira(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#080d1a] border border-indigo-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Əlavə Qeyd
                </label>
                <input
                  type="text"
                  maxLength={500}
                  value={editQeyd}
                  onChange={(e) => setEditQeyd(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#080d1a] border border-indigo-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-indigo-950">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/40 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? 'Yenilənir...' : 'Yenilə'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
