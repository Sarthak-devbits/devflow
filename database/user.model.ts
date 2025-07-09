import { model, models, Schema, Document } from "mongoose";

export interface IUserInterface {
  name: string;
  username: string;
  email: string;
  bio?: string;
  image?: string;
  location?: string;
  portfolio?: string;
  reputation?: number;
}

export interface IUserDoc extends IUserInterface, Document {}

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      required: true,
      type: String,
      email: true,
    },
    bio: {
      type: String,
    },
    image: {
      type: String,
    },
    location: {
      type: String,
    },
    portfolio: {
      type: String,
    },
    reputation: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = models?.User || model<IUserInterface>("User", UserSchema);

export default User;
