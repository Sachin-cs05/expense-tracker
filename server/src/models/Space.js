import mongoose from "mongoose";

const spaceSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    icon: { type: String, default: "🗂️" },
    description: { type: String, default: "" },
    color: { type: String, default: "#4F46E5" }
  },
  { timestamps: true, versionKey: false }
);

spaceSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.ownerId = returnedObject.ownerId.toString();
    delete returnedObject._id;
    return returnedObject;
  }
});

export const Space = mongoose.model("Space", spaceSchema);
