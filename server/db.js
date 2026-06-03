import { MongoClient } from "mongodb";
import "dotenv/config";

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME || "react";
const collectionName = process.env.MONGO_COLLECTION_NAME || "profile";

if (!uri) {
  throw new Error("MONGO_URI is required. Add it to your .env file.");
}

const client = new MongoClient(uri);
let db;

export const getDb = async () => {
  if (!db) {
    await client.connect();
    db = client.db(dbName);
    await db.collection(collectionName).createIndex({ mobile: 1 }, { unique: true });
  }

  return db;
};

export const getProfileCollection = async () => {
  const database = await getDb();
  return database.collection(collectionName);
};
