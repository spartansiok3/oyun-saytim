import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Pack from '@/models/Pack';
import Question from '@/models/Question';
import AdminQuestionManager, {
  AdminPackDetail,
  AdminQuestionItem,
} from './AdminQuestionManager';

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
        title: `${pack.ad} - Sualların İdarəsi | İnzibatçı Paneli`,
      };
    }
  } catch (e) {
    console.error('Metadata error:', e);
  }

  return { title: 'Paket İdarəsi | İnzibatçı Paneli' };
}

export default async function AdminPackDetailPage({ params }: PageProps) {
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

  const packDetail: AdminPackDetail = {
    _id: pack._id.toString(),
    ad: pack.ad,
    kateqoriya: pack.kateqoriya || 'Ümumi',
    aktiv: pack.aktiv ?? true,
  };

  const questions: AdminQuestionItem[] = rawQuestions.map((q) => ({
    _id: q._id.toString(),
    sira: q.sira,
    sual: q.sual,
    cavab: q.cavab,
    qeyd: q.qeyd || '',
    vaxt: q.vaxt || 60,
  }));

  return <AdminQuestionManager pack={packDetail} questions={questions} />;
}
