// IMPORTANT
import mongoose, { Mongoose } from "mongoose";
import logger from "./logger";

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
    logger.info("Using existin Mongoose Connection");
    return cached.conn;
  }
  if (!cached.promise) {
    // NOTE: a promise always return a promise object
    cached.promise = mongoose
      .connect(MONGODB_URI)
      .then((mongooseInstance) => {
        logger.info("Connected to MongoDB");
        return mongooseInstance;
      })
      .catch((error) => {
        logger.error("Failed to connect to MongoDB:", error);
        throw new Error("Failed to connect to MongoDB");
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default dbConnect;
