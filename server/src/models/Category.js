import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    icon: { type: String, default: "🏷️" },
    color: { type: String, default: "#4F46E5" },
    type: { type: String, enum: ["expense", "income"], default: "expense" }
  },
  { timestamps: true, versionKey: false }
);

categorySchema.index({ ownerId: 1, name: 1, type: 1 }, { unique: true });

categorySchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.ownerId = returnedObject.ownerId.toString();
    delete returnedObject._id;
    return returnedObject;
  }
});

export const Category = mongoose.model("Category", categorySchema);
