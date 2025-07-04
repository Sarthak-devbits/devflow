// IMPORTANT
import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const dbConnect = async (): Promise<Mongoose | null> => {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {

    // NOTE: a promise always return a promise object
    cached.promise = mongoose
      .connect(MONGODB_URI)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((error) => {
        console.error("Failed to connect to MongoDB:", error);
        throw new Error("Failed to connect to MongoDB");
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default dbConnect;
