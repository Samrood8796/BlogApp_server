import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      min: 2,
      max: 40,
      unique: true,
    },
    name: String,
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
    },
    phoneNumber: {
      type: Number,
    },
    profilePic:{
      type: String,
    },
    imagePath: {
      type: String,
      default: "",
    },
    bio: String,
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;