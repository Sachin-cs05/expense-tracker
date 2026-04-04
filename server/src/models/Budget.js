import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    month: { type: String, required: true },
    amount: { type: Number, required: true }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

budgetSchema.index({ ownerId: 1, month: 1 }, { unique: true });

budgetSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.ownerId = returnedObject.ownerId.toString();
    delete returnedObject._id;
    return returnedObject;
  }
});

export const Budget = mongoose.model("Budget", budgetSchema);
