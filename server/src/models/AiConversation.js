import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true, maxlength: 5000 },
    timestamp: { type: Date, default: Date.now }
  },
  { _id: false }
);

const aiConversationSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    messages: { type: [messageSchema], default: [] },
    title: { type: String, default: "New Conversation", maxlength: 100 }
  },
  { timestamps: true, versionKey: false }
);

// Auto-expire conversations after 30 days
aiConversationSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

aiConversationSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.ownerId = returnedObject.ownerId.toString();
    delete returnedObject._id;
    return returnedObject;
  }
});

export const AiConversation = mongoose.model("AiConversation", aiConversationSchema);
