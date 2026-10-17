import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPack extends Document {
  ad: string;
  kateqoriya: string;
  aktiv: boolean;
  yaradilmaTarixi: Date;
}

const PackSchema = new Schema<IPack>(
  {
    ad: {
      type: String,
      required: [true, 'Paket adı məcburidir'],
      trim: true,
    },
    kateqoriya: {
      type: String,
      required: false,
      default: 'Ümumi',
      trim: true,
    },
    aktiv: {
      type: Boolean,
      default: true,
    },
    yaradilmaTarixi: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

const Pack: Model<IPack> =
  mongoose.models.Pack || mongoose.model<IPack>('Pack', PackSchema);

export default Pack;
