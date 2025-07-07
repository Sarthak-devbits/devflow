import { model, models, Schema } from "mongoose";

export interface ITag {
  name: String;
  questions: number;
}

export interface ITagDoc extends ITag, Document {}
const TagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    questions: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Tag = models?.Tag || model<ITag>("", TagSchema);

export default Tag;
