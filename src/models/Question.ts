import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IQuestion extends Document {
  packId: Types.ObjectId;
  sira: number;
  sual: string;
  cavab: string;
  qeyd?: string;
  vaxt: number;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    packId: {
      type: Schema.Types.ObjectId,
      ref: 'Pack',
      required: [true, 'Paket ID-si (packId) məcburidir'],
    },
    sira: {
      type: Number,
      required: true,
      default: 1,
    },
    sual: {
      type: String,
      required: [true, 'Sual mətni məcburidir'],
      trim: true,
    },
    cavab: {
      type: String,
      required: [true, 'Cavab mətni məcburidir'],
      trim: true,
    },
    qeyd: {
      type: String,
      required: false,
      default: '',
      trim: true,
    },
    vaxt: {
      type: Number,
      default: 60,
    },
  },
  {
    timestamps: false,
  }
);

const Question: Model<IQuestion> =
  mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);

export default Question;
