'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export interface QuestionData {
  _id: string;
  sira: number;
  sual: string;
  cavab: string;
  qeyd?: string;
  vaxt: number;
}

export interface PackData {
  _id: string;
  ad: string;
  kateqoriya: string;
}

interface PaketViewerProps {
  pack: PackData;
  questions: QuestionData[];
}

export default function PaketViewer({ pack, questions }: PaketViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex];

  const [timeLeft, setTimeLeft] = useState(currentQuestion?.vaxt || 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Səs siqnalı (Web Audio API)
  const playBeep = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // 3 qısa xəbərdarlıq siqnalı
      const delays = [0, 0.22, 0.44];
      delays.forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Sonuncu siqnal bir qədər fərqli tonda
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(idx === 2 ? 1046.5 : 880, now + delay);

        gain.gain.setValueAtTime(0.35, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.18);
      });
    } catch (e) {
      console.warn('Səs siqnalı çalına bilmədi:', e);
    }
  };

  // Sual dəyişəndə taymer və cavabı yenilə
  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(currentQuestion.vaxt || 60);
      setIsRunning(false);
      setShowAnswer(false);
    }
  }, [currentIndex, currentQuestion]);

  // Taymerin geri sayımı
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          playBeep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  // Taymer düymələri
  const handleStart = () => {
    if (timeLeft === 0 && currentQuestion) {
      setTimeLeft(currentQuestion.vaxt || 60);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (currentQuestion) {
      setTimeLeft(currentQuestion.vaxt || 60);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="py-20 text-center max-w-lg mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-slate-200">Bu paketdə sual yoxdur</h2>
        <p className="text-slate-400 text-sm">
          Bu paketə hələlik heç bir sual əlavə edilməyib.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors"
        >
          ← Paketlərə qayıt
        </Link>
      </div>
    );
  }

  // Taymer formatı: MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  // Son 10 saniyədə qırmızı rəng
  const isUrgent = timeLeft <= 10 && timeLeft > 0;
  const isFinished = timeLeft === 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Üst naviqasiya və paket məlumatı */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-indigo-950/60">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-300 hover:text-white transition-colors"
        >
          <span>←</span> Paketlərə qayıt
        </Link>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/70 text-purple-300 border border-purple-800/40">
            {pack.kateqoriya}
          </span>
          <span className="text-sm font-bold text-slate-200">{pack.ad}</span>
        </div>
      </div>

      {/* Sual və taymer paneli */}
      <div className="rounded-3xl bg-[#0e1629] border border-indigo-900/40 p-6 sm:p-10 shadow-2xl space-y-8">
        {/* Sual başlığı və ardıcıllıq */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-sm font-bold tracking-wide">
              Sual {currentQuestion.sira || currentIndex + 1}
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-400">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>

        {/* İri oxunaqlı Sual mətni */}
        <div className="min-h-[140px] flex items-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-relaxed sm:leading-relaxed text-slate-100 select-text">
            {currentQuestion.sual}
          </h2>
        </div>

        {/* Taymer Bölməsi */}
        <div className="pt-6 border-t border-indigo-950/80 flex flex-col items-center justify-center space-y-5">
          {/* Taymer Ekranı */}
          <div
            className={`flex flex-col items-center justify-center px-8 py-4 rounded-2xl border transition-all duration-300 ${
              isFinished
                ? 'bg-red-950/60 border-red-600/70 text-red-400 shadow-lg shadow-red-950/50'
                : isUrgent
                ? 'bg-red-950/40 border-red-500/60 text-red-500 animate-pulse shadow-lg shadow-red-950/50'
                : 'bg-indigo-950/40 border-indigo-800/40 text-indigo-200'
            }`}
          >
            <div className="text-6xl sm:text-7xl md:text-8xl font-black font-mono tracking-wider">
              {formattedMinutes}:{formattedSeconds}
            </div>
            <div className="text-xs uppercase font-bold tracking-widest mt-1 text-slate-400">
              {isFinished ? 'Vaxt bitdi!' : isUrgent ? 'Son saniyələr!' : 'Qalan vaxt'}
            </div>
          </div>

          {/* Taymer İdarəetmə Düymələri */}
          <div className="flex items-center gap-3">
            {!isRunning ? (
              <button
                type="button"
                onClick={handleStart}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/40 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>▶</span> Başla
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePause}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-amber-950/40 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>⏸</span> Dayandır
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm sm:text-base active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>↺</span> Sıfırla
            </button>
          </div>
        </div>

        {/* Cavabı göstər bölməsi */}
        <div className="pt-6 border-t border-indigo-950/80 flex flex-col items-center space-y-4">
          <button
            type="button"
            onClick={() => setShowAnswer((prev) => !prev)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-lg shadow-indigo-950/50 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{showAnswer ? '🙈' : '💡'}</span>
            <span>{showAnswer ? 'Cavabı gizlət' : 'Cavabı göstər'}</span>
          </button>

          {showAnswer && (
            <div className="w-full rounded-2xl bg-gradient-to-b from-indigo-950/70 to-purple-950/50 border border-indigo-500/40 p-6 space-y-3 animate-fadeIn">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                  Doğru cavab:
                </span>
                <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                  {currentQuestion.cavab}
                </p>
              </div>

              {currentQuestion.qeyd && (
                <div className="pt-3 border-t border-indigo-900/60">
                  <span className="text-xs font-semibold text-indigo-300 block mb-0.5">
                    Əlavə qeyd:
                  </span>
                  <p className="text-sm text-slate-300 italic leading-normal">
                    {currentQuestion.qeyd}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Naviqasiya düymələri: Əvvəlki və Növbəti */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#0e1629]/80 border border-indigo-900/30">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`px-5 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 transition-all cursor-pointer ${
            currentIndex === 0
              ? 'opacity-40 bg-slate-900 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-800/40 active:scale-95'
          }`}
        >
          <span>←</span> Əvvəlki sual
        </button>

        <div className="text-sm sm:text-base font-bold text-indigo-300">
          Sual {currentIndex + 1} / {questions.length}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
          className={`px-5 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 transition-all cursor-pointer ${
            currentIndex === questions.length - 1
              ? 'opacity-40 bg-slate-900 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/40 active:scale-95'
          }`}
        >
          Növbəti sual <span>→</span>
        </button>
      </div>
    </div>
  );
}
