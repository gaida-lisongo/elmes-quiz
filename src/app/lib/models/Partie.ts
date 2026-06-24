import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReponsePartie {
  quizId: mongoose.Types.ObjectId;
  reponseDonnee?: string;
  estCorrecte: boolean;
}

export interface IPartie extends Document {
  playerId: mongoose.Types.ObjectId;
  categorieId: mongoose.Types.ObjectId;
  levelPlayed: number;
  reponses: IReponsePartie[];
  note: number;
  status: 'EN_COURS' | 'TERMINE';
  createdAt: Date;
  updatedAt: Date;
}

const PartieSchema: Schema<IPartie> = new Schema(
  {
    playerId: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    categorieId: { type: Schema.Types.ObjectId, ref: 'Categorie', required: true },
    levelPlayed: { type: Number, required: true },
    reponses: [
      {
        quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
        reponseDonnee: { type: String },
        estCorrecte: { type: Boolean, required: true } // Note: Remplacé par Boolean lors de l'exécution réelle
      }
    ],
    note: { type: Number, required: true },
    status: { type: String, enum: ['EN_COURS', 'TERMINE'], default: 'EN_COURS' }
  },
  { timestamps: true }
);

// Correction rapide d'une petite coquille de frappe sur le type Mongoose de estCorrecte si tu fais un copier/coller :
// estCorrecte: { type: Boolean, required: true }

const Partie: Model<IPartie> = mongoose.models.Partie || mongoose.model<IPartie>('Partie', PartieSchema);
export default Partie;