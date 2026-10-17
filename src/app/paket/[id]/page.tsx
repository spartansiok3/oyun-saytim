import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Pack from '@/models/Pack';
import Question from '@/models/Question';
import PaketViewer, { PackData, QuestionData } from './PaketViewer';

export const instant = false;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { title: 'Paket tapılmadı' };
  }

  try {
    await connectToDatabase();
    const pack = await Pack.findById(id).lean();
    if (pack) {
      return {
        title: `${pack.ad} | İntellektual Oyun`,
        description: `${pack.kateqoriya} üzrə suallar`,
      };
    }
  } catch (e) {
    console.error('Metadata xətası:', e);
  }

  return { title: 'Paket | İntellektual Oyun' };
}

export default async function PaketPage({ params }: PageProps) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  await connectToDatabase();

  const pack = await Pack.findById(id).lean();

  if (!pack) {
    notFound();
  }

  const rawQuestions = await Question.find({ packId: id })
    .sort({ sira: 1 })
    .lean();

  const packData: PackData = {
    _id: pack._id.toString(),
    ad: pack.ad,
    kateqoriya: pack.kateqoriya || 'Ümumi',
  };

  const questions: QuestionData[] = rawQuestions.map((q) => ({
    _id: q._id.toString(),
    sira: q.sira,
    sual: q.sual,
    cavab: q.cavab,
    qeyd: q.qeyd || '',
    vaxt: q.vaxt || 60,
  }));

  return <PaketViewer pack={packData} questions={questions} />;
}
