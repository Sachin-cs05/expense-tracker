import mongoose from "mongoose";

const recurringPaymentSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    frequency: { type: String, enum: ["weekly", "monthly", "yearly"], default: "monthly" },
    nextPaymentDate: { type: String, required: true },
    active: { type: Boolean, default: true },
    notes: { type: String, default: "" }
  },
  { timestamps: true, versionKey: false }
);

recurringPaymentSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.ownerId = returnedObject.ownerId.toString();
    delete returnedObject._id;
    return returnedObject;
  }
});

export const RecurringPayment = mongoose.model("RecurringPayment", recurringPaymentSchema);
