import { MongoClient, type Collection, type Db } from "mongodb";
import { config } from "./config.js";
import type { EventDoc, JoinDoc } from "./types.js";

// keep one client per process, serverless functions reuse it between requests
let clientPromise: Promise<MongoClient> | null = null;
let indexesReady = false;

async function getDb(): Promise<Db> {
  if (!clientPromise) {
    clientPromise = new MongoClient(config.mongoUri).connect();
  }
  const client = await clientPromise;
  const db = client.db(config.dbName);

  if (!indexesReady) {
    indexesReady = true;
    await Promise.all([
      db.collection("events").createIndex({ eventDate: 1 }),
      db.collection("events").createIndex({ creatorEmail: 1 }),
      db.collection("joins").createIndex({ eventId: 1, userEmail: 1 }, { unique: true }),
      db.collection("joins").createIndex({ userEmail: 1 }),
    ]);
  }
  return db;
}

export async function eventsCol(): Promise<Collection<EventDoc>> {
  return (await getDb()).collection<EventDoc>("events");
}

export async function joinsCol(): Promise<Collection<JoinDoc>> {
  return (await getDb()).collection<JoinDoc>("joins");
}
