'use server';

import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/mongodb';
import Pack from '@/models/Pack';
import Question from '@/models/Question';
import {
  verifyAdminPassword,
  setAdminSession,
  clearAdminSession,
  requireAuth,
} from '@/lib/auth';

/**
 * Giriş əməliyyatı
 */
export async function loginAction(password: string): Promise<{ success: boolean; error?: string }> {
  // Boş parol yoxlanışı
  if (!password || typeof password !== 'string') {
    return { success: false, error: 'Zəhmət olmasa şifrəni daxil edin.' };
  }

  const isValid = verifyAdminPassword(password);

  if (!isValid) {
    // Brute-force hücumlarına qarşı gecikmə
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: false, error: 'Daxil edilən şifrə yalnışdır.' };
  }

  await setAdminSession();
  return { success: true };
}

/**
 * Çıxış əməliyyatı
 */
export async function logoutAction(): Promise<void> {
  await clearAdminSession();
}

/**
 * Yeni paket yaratma
 */
export async function createPackAction(formData: {
  ad: string;
  kateqoriya?: string;
}): Promise<{ success: boolean; error?: string; packId?: string }> {
  await requireAuth();

  const ad = formData.ad?.trim();
  const kateqoriya = (formData.kateqoriya?.trim() || 'Ümumi');

  if (!ad) {
    return { success: false, error: 'Paketin adı boş ola bilməz.' };
  }
  if (ad.length > 200) {
    return { success: false, error: 'Paketin adı ən çox 200 simvol ola bilər.' };
  }
  if (kateqoriya.length > 100) {
    return { success: false, error: 'Kateqoriya ən çox 100 simvol ola bilər.' };
  }

  await connectToDatabase();

  const newPack = await Pack.create({
    ad,
    kateqoriya,
    aktiv: true,
    yaradilmaTarixi: new Date(),
  });

  revalidatePath('/admin');
  revalidatePath('/');

  return { success: true, packId: newPack._id.toString() };
}

/**
 * Paketin aktiv/passiv vəziyyətini dəyişmək
 */
export async function togglePackStatusAction(
  packId: string
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();

  if (!packId || !mongoose.Types.ObjectId.isValid(packId)) {
    return { success: false, error: 'Yalnış paket ID-si.' };
  }

  await connectToDatabase();

  const pack = await Pack.findById(packId);
  if (!pack) {
    return { success: false, error: 'Paket tapılmadı.' };
  }

  pack.aktiv = !pack.aktiv;
  await pack.save();

  revalidatePath('/admin');
  revalidatePath('/');

  return { success: true };
}

/**
 * Paketin adını və kateqoriyasını redaktə etmək
 */
export async function updatePackAction(
  packId: string,
  formData: { ad: string; kateqoriya?: string }
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();

  if (!packId || !mongoose.Types.ObjectId.isValid(packId)) {
    return { success: false, error: 'Yalnış paket ID-si.' };
  }

  const ad = formData.ad?.trim();
  const kateqoriya = (formData.kateqoriya?.trim() || 'Ümumi');

  if (!ad) {
    return { success: false, error: 'Paketin adı boş ola bilməz.' };
  }
  if (ad.length > 200) {
    return { success: false, error: 'Paketin adı ən çox 200 simvol ola bilər.' };
  }
  if (kateqoriya.length > 100) {
    return { success: false, error: 'Kateqoriya ən çox 100 simvol ola bilər.' };
  }

  await connectToDatabase();

  const updated = await Pack.findByIdAndUpdate(
    packId,
    { ad, kateqoriya },
    { new: true }
  );

  if (!updated) {
    return { success: false, error: 'Paket tapılmadı.' };
  }

  revalidatePath('/admin');
  revalidatePath(`/admin/paket/${packId}`);
  revalidatePath(`/paket/${packId}`);
  revalidatePath('/');

  return { success: true };
}

/**
 * Paketi silmək (bütün sualları ilə birlikdə)
 */
export async function deletePackAction(
  packId: string
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();

  if (!packId || !mongoose.Types.ObjectId.isValid(packId)) {
    return { success: false, error: 'Yalnış paket ID-si.' };
  }

  await connectToDatabase();

  const pack = await Pack.findByIdAndDelete(packId);
  if (!pack) {
    return { success: false, error: 'Silinəcək paket tapılmadı.' };
  }

  // Paketin bütün suallarını da sil
  await Question.deleteMany({ packId });

  revalidatePath('/admin');
  revalidatePath('/');

  return { success: true };
}

/**
 * Yeni sual əlavə etmək
 */
export async function createQuestionAction(
  packId: string,
  data: {
    sual: string;
    cavab: string;
    qeyd?: string;
    vaxt?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();

  if (!packId || !mongoose.Types.ObjectId.isValid(packId)) {
    return { success: false, error: 'Yalnış paket ID-si.' };
  }

  const sual = data.sual?.trim();
  const cavab = data.cavab?.trim();
  const qeyd = data.qeyd?.trim() || '';
  const vaxt = Number(data.vaxt) || 60;

  if (!sual) {
    return { success: false, error: 'Sual mətni boş ola bilməz.' };
  }
  if (sual.length > 1000) {
    return { success: false, error: 'Sual mətni ən çox 1000 simvol ola bilər.' };
  }

  if (!cavab) {
    return { success: false, error: 'Cavab mətni boş ola bilməz.' };
  }
  if (cavab.length > 500) {
    return { success: false, error: 'Cavab mətni ən çox 500 simvol ola bilər.' };
  }

  if (qeyd.length > 500) {
    return { success: false, error: 'Qeyd ən çox 500 simvol ola bilər.' };
  }

  if (isNaN(vaxt) || vaxt < 5 || vaxt > 600) {
    return { success: false, error: 'Vaxt 5 ilə 600 saniyə arasında olmalıdır.' };
  }

  await connectToDatabase();

  const pack = await Pack.findById(packId);
  if (!pack) {
    return { success: false, error: 'Paket tapılmadı.' };
  }

  // Sira nömrəsini avtomatik növbəti nömrə təyin et
  const lastQuestion = await Question.findOne({ packId })
    .sort({ sira: -1 })
    .select('sira')
    .lean();
  const nextSira = lastQuestion && typeof lastQuestion.sira === 'number' ? lastQuestion.sira + 1 : 1;

  await Question.create({
    packId,
    sira: nextSira,
    sual,
    cavab,
    qeyd,
    vaxt,
  });

  revalidatePath(`/admin/paket/${packId}`);
  revalidatePath(`/paket/${packId}`);
  revalidatePath('/admin');
  revalidatePath('/');

  return { success: true };
}

/**
 * Sualı redaktə etmək
 */
export async function updateQuestionAction(
  questionId: string,
  packId: string,
  data: {
    sual: string;
    cavab: string;
    qeyd?: string;
    vaxt: number;
    sira?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();

  if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
    return { success: false, error: 'Yalnış sual ID-si.' };
  }
  if (!packId || !mongoose.Types.ObjectId.isValid(packId)) {
    return { success: false, error: 'Yalnış paket ID-si.' };
  }

  const sual = data.sual?.trim();
  const cavab = data.cavab?.trim();
  const qeyd = data.qeyd?.trim() || '';
  const vaxt = Number(data.vaxt);

  if (!sual) {
    return { success: false, error: 'Sual mətni boş ola bilməz.' };
  }
  if (sual.length > 1000) {
    return { success: false, error: 'Sual mətni ən çox 1000 simvol ola bilər.' };
  }

  if (!cavab) {
    return { success: false, error: 'Cavab mətni boş ola bilməz.' };
  }
  if (cavab.length > 500) {
    return { success: false, error: 'Cavab mətni ən çox 500 simvol ola bilər.' };
  }

  if (qeyd.length > 500) {
    return { success: false, error: 'Qeyd ən çox 500 simvol ola bilər.' };
  }

  if (isNaN(vaxt) || vaxt < 5 || vaxt > 600) {
    return { success: false, error: 'Vaxt 5 ilə 600 saniyə arasında olmalıdır.' };
  }

  await connectToDatabase();

  const updateFields: Record<string, unknown> = {
    sual,
    cavab,
    qeyd,
    vaxt,
  };

  if (typeof data.sira === 'number' && data.sira > 0) {
    updateFields.sira = data.sira;
  }

  const updated = await Question.findByIdAndUpdate(questionId, updateFields, {
    new: true,
  });

  if (!updated) {
    return { success: false, error: 'Sual tapılmadı.' };
  }

  revalidatePath(`/admin/paket/${packId}`);
  revalidatePath(`/paket/${packId}`);
  revalidatePath('/admin');

  return { success: true };
}

/**
 * Sualı silmək
 */
export async function deleteQuestionAction(
  questionId: string,
  packId: string
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();

  if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
    return { success: false, error: 'Yalnış sual ID-si.' };
  }

  await connectToDatabase();

  const deleted = await Question.findByIdAndDelete(questionId);
  if (!deleted) {
    return { success: false, error: 'Silinəcək sual tapılmadı.' };
  }

  revalidatePath(`/admin/paket/${packId}`);
  revalidatePath(`/paket/${packId}`);
  revalidatePath('/admin');
  revalidatePath('/');

  return { success: true };
}
