import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEquipeMetrics {
  competitions: number;
  soldeUsd: number;
  matchsWin: number;
}

export interface IEquipe extends Document {
  chefId: mongoose.Types.ObjectId;
  designation: string;
  membres: mongoose.Types.ObjectId[];
  metriques: IEquipeMetrics;
  createdAt: Date;
  updatedAt: Date;
}

const EquipeSchema: Schema<IEquipe> = new Schema(
  {
    chefId: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    designation: { type: String, required: true, trim: true },
    membres: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    metriques: {
      competitions: { type: Number, default: 0 },
      soldeUsd: { type: Number, default: 0 },
      matchsWin: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const Equipe: Model<IEquipe> =
  mongoose.models.Equipe || mongoose.model<IEquipe>('Equipe', EquipeSchema);
export default Equipe;