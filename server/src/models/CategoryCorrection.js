import mongoose from "mongoose";

/**
 * Tracks when a user corrects an AI-suggested category.
 * Used to improve per-user categorization over time.
 */
const categoryCorrectionSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    description: { type: String, required: true, maxlength: 500 },
    descriptionLower: { type: String, required: true, maxlength: 500, index: true },
    suggestedCategory: { type: String, required: true },
    correctedCategory: { type: String, required: true }
  },
  { timestamps: true, versionKey: false }
);

// Compound index for efficient lookups: find corrections by user + description pattern
categoryCorrectionSchema.index({ ownerId: 1, descriptionLower: 1 });

// Auto-expire old corrections after 180 days
categoryCorrectionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

categoryCorrectionSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.ownerId = returnedObject.ownerId.toString();
    delete returnedObject._id;
    return returnedObject;
  }
});

export const CategoryCorrection = mongoose.model("CategoryCorrection", categoryCorrectionSchema);
