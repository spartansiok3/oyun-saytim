import connectToDatabase from '@/lib/mongodb';
import Pack from '@/models/Pack';
import Question from '@/models/Question';
import AdminPackList, { AdminPackItem } from './AdminPackList';

export const instant = false;

export const metadata = {
  title: 'Paketlərin İdarə Edilməsi | İnzibatçı Paneli',
  description: 'İntellektual oyun paketlərinin siyahısı və idarəetməsi',
};

export default async function AdminPacksPage() {
  await connectToDatabase();

  const packs = await Pack.find().sort({ yaradilmaTarixi: -1 }).lean();

  let formattedPacks: AdminPackItem[] = [];

  if (packs.length > 0) {
    const packIds = packs.map((p) => p._id);
    const counts = await Question.aggregate([
      { $match: { packId: { $in: packIds } } },
      { $group: { _id: '$packId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>(
      counts.map((c) => [c._id.toString(), c.count])
    );

    formattedPacks = packs.map((p) => {
      const date = p.yaradilmaTarixi ? new Date(p.yaradilmaTarixi) : new Date();
      const formattedDate = date.toLocaleDateString('az-AZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      return {
        _id: p._id.toString(),
        ad: p.ad,
        kateqoriya: p.kateqoriya || 'Ümumi',
        aktiv: p.aktiv ?? true,
        sualSayi: countMap.get(p._id.toString()) || 0,
        yaradilmaTarixi: formattedDate,
      };
    });
  }

  return <AdminPackList packs={formattedPacks} />;
}
