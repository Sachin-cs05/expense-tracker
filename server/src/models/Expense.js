import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: String, required: true },
    description: { type: String, required: true },
    paymentMethod: { type: String, default: "Other" },
    notes: { type: String, default: "" },
    spaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Space", default: null }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

expenseSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.ownerId = returnedObject.ownerId.toString();
    returnedObject.spaceId = returnedObject.spaceId ? returnedObject.spaceId.toString() : null;
    delete returnedObject._id;
    return returnedObject;
  }
});

export const Expense = mongoose.model("Expense", expenseSchema);
