import { Schema, model, Document, Types } from "mongoose";
import { Role } from "./authTypes";
export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName: string,
  email: string;
  password: string;
  role: Role;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER
    },
  },
  { timestamps: true }
);

export const UserModel = model<IUser>("User", userSchema);
