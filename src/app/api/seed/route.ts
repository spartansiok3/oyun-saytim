import { NextRequest, NextResponse, connection } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Pack from '@/models/Pack';
import Question from '@/models/Question';

export async function GET(request: NextRequest) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || key !== adminPassword) {
      return NextResponse.json(
        { xeta: 'İcazəsiz giriş: Açardır və ya ADMIN_PASSWORD təyin edilməyib.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Nümunə paketi yarat
    const pack = await Pack.create({
      ad: 'Nümunə paket',
      kateqoriya: 'Azərbaycan Mədəniyyəti və Tarixi',
      aktiv: true,
      yaradilmaTarixi: new Date(),
    });

    const questionsData = [
      {
        packId: pack._id,
        sira: 1,
        sual: 'Azərbaycanın və bütün Şərqin ilk operası hansıdır və müəllifi kimdir?',
        cavab: '"Leyli və Məcnun" operası, Üzeyir Hacıbəyli (1908-ci il)',
        qeyd: 'Əsərin premyerası 1908-ci il yanvarın 25-də Bakıda Hacı Zeynalabdin Tağıyevin teatrında baş tutmuşdur.',
        vaxt: 60,
      },
      {
        packId: pack._id,
        sira: 2,
        sual: '1752-ci ildə Şuşa qalasının əsasını qoyan Qarabağ xanı kimdir?',
        cavab: 'Pənahəli xan Cavanşir',
        qeyd: 'Qala ilk dövrlərdə xanın şərəfinə Pənahabad adlandırılmışdır.',
        vaxt: 60,
      },
      {
        packId: pack._id,
        sira: 3,
        sual: 'Qobustan qayaüstü təsvirlərində əksini tapmış ən qədim milli kollektiv rəqsimiz hansıdır?',
        cavab: 'Yallı',
        qeyd: 'Qobustandakı qayaüstü rəsmlərdə əl-ələ tutaraq dövrə vuran insanların rəqsi təsvir edilib.',
        vaxt: 60,
      },
      {
        packId: pack._id,
        sira: 4,
        sual: '1918-ci il mayın 28-də elan edilən Azərbaycan Xalq Cümhuriyyətinin Milli Şurasının sədri kim olmuşdur?',
        cavab: 'Məhəmməd Əmin Rəsulzadə',
        qeyd: 'İstiqlal Bəyannaməsi Tiflis şəhərində qəbul edilmişdir.',
        vaxt: 60,
      },
      {
        packId: pack._id,
        sira: 5,
        sual: 'Nizami Gəncəvinin ölməz "Xəmsə"sinə daxil olan ilk poemanın adı nədir?',
        cavab: '"Sirlər xəzinəsi" (Məxzənül-əsrar)',
        qeyd: 'Əxlaqi-fəlsəfi məzmun daşıyan bu əsər təxminən 1174-1175-ci illərdə qələmə alınmışdır.',
        vaxt: 60,
      },
    ];

    const questions = await Question.insertMany(questionsData);

    return NextResponse.json({
      mesaj: 'Nümunə paket və suallar uğurla bazaya əlavə edildi.',
      pack,
      sualSayi: questions.length,
    });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'digest' in error &&
      typeof (error as { digest: string }).digest === 'string' &&
      (error as { digest: string }).digest.startsWith('NEXT_')
    ) {
      throw error;
    }

    console.error('Seed xətası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Naməlum xəta';
    return NextResponse.json(
      { xeta: 'Məlumat bazasına yazılarkən xəta baş verdi', melumat: errorMessage },
      { status: 500 }
    );
  }
}
