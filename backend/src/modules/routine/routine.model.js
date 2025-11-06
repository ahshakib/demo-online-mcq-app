import mongoose from "mongoose";

const routineSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "running", "completed"],
      default: "upcoming",
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

// optional: auto-update status
routineSchema.pre("save", function (next) {
  const now = new Date();
  const examStart = new Date(this.date);
  if (now > examStart) this.status = "completed";
  next();
});

export const Routine = mongoose.model("Routine", routineSchema);
