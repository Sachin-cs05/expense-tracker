import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    source: { type: String, required: true },
    category: { type: String, required: true },
    paymentMethod: { type: String, default: "Bank Transfer" },
    date: { type: String, required: true },
    notes: { type: String, default: "" },
    spaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Space", default: null }
  },
  { timestamps: true, versionKey: false }
);

incomeSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.ownerId = returnedObject.ownerId.toString();
    returnedObject.spaceId = returnedObject.spaceId ? returnedObject.spaceId.toString() : null;
    delete returnedObject._id;
    return returnedObject;
  }
});

export const Income = mongoose.model("Income", incomeSchema);
