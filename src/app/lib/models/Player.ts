import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRecharge {
  amount: number;
  providerTxId: string;
  status: 'EN_ATTENTE' | 'SUCCES' | 'ECHEC';
  targetLevel: number;
  createdAt: Date;
}

export interface IRetrait {
  amount: number;
  providerTxId: string;
  status: 'EN_ATTENTE' | 'SUCCES' | 'ECHEC';
  createdAt: Date;
}

export interface IMetrics {
  totalScore: number;
  partiesJouees: number;
  MeilleurScore: number;
}

export interface IPlayer extends Document {
  userId: mongoose.Types.ObjectId;
  level: 0 | 1 | 2 | 3;
  school: string;
  parties: number;
  recharges: IRecharge[];
  retraits: IRetrait[];
  metrics: IMetrics;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema: Schema<IPlayer> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    level: { type: Number, enum: [0, 1, 2, 3], default: 0 },
    school: { type: String, required: true },
    parties: { type: Number, default: 0},
    recharges: [
      {
        amount: { type: Number, required: true },
        providerTxId: { type: String, required: true },
        status: { type: String, enum: ['EN_ATTENTE', 'SUCCES', 'ECHEC'], default: 'EN_ATTENTE' },
        targetLevel: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    retraits: [
      {
        amount: { type: Number, required: true },
        providerTxId: { type: String, required: true },
        status: { type: String, enum: ['EN_ATTENTE', 'SUCCES', 'ECHEC'], default: 'EN_ATTENTE' },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    metrics: {
      totalScore: { type: Number, default: 0 },
      partiesJouees: { type: Number, default: 0 },
      MeilleurScore: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

const Player: Model<IPlayer> = mongoose.models.Player || mongoose.model<IPlayer>('Player', PlayerSchema);
export default Player;