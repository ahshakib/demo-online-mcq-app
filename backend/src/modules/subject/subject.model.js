import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String }, // optional subject banner

    // Relations
    chapters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',
      },
    ],
    routine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Routine',
    },

    // Monetization
    price: { type: Number, default: 0 }, // for paid packages
    isPremium: { type: Boolean, default: false },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // admin
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Subject', subjectSchema);
