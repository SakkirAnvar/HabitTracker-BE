import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePhoto: {
      type: String,
      default: "/default-avatar.png",
    },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", UserSchema);

export default User;
