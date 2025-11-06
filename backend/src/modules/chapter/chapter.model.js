import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    order: {
      type: Number,
      default: 1, // to keep chapters ordered within a subject
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Admin who created it
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Chapter', chapterSchema);
