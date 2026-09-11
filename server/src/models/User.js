import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: false
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true
    },
    githubId: {
      type: String,
      sparse: true,
      unique: true
    },
    avatarUrl: {
      type: String,
      trim: true
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local"
    },
    currency: {
      type: String,
      default: "INR"
    },
    dateFormat: {
      type: String,
      default: "yyyy-MM-dd"
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

userSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.passwordHash;
    return returnedObject;
  }
});

export const User = mongoose.model("User", userSchema);