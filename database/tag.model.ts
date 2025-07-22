import mongoose, {
  Schema,
  model,
  models,
  InferSchemaType,
  HydratedDocument,
} from "mongoose";

// Schema definition
const TagSchema = new Schema(
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

// Infer types from schema
type ITag = InferSchemaType<typeof TagSchema>;
export type ITagDoc = HydratedDocument<ITag>;

// Create model
const Tag = models?.Tag || model<ITag>("Tag", TagSchema);

export default Tag;
