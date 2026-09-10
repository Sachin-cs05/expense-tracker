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
      required: true
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