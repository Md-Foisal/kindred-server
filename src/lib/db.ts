import { MongoClient, type Collection, type Db } from "mongodb";
import { config } from "./config.js";
import type { EventDoc, JoinDoc } from "./types.js";

// keep one client per process, serverless functions reuse it between requests
let clientPromise: Promise<MongoClient> | null = null;
let indexesReady = false;

async function getDb(): Promise<Db> {
  if (!clientPromise) {
    // forget a failed connect so the next request can try again
    clientPromise = new MongoClient(config.mongoUri).connect().catch((err) => {
      clientPromise = null;
      throw err;
    });
  }
  const client = await clientPromise;
  const db = client.db(config.dbName);

  if (!indexesReady) {
    await Promise.all([
      db.collection("events").createIndex({ eventDate: 1 }),
      db.collection("events").createIndex({ creatorEmail: 1 }),
      db.collection("joins").createIndex({ eventId: 1, userEmail: 1 }, { unique: true }),
      db.collection("joins").createIndex({ userEmail: 1 }),
    ]);
    // only mark done after it worked, so a failed try runs again next time
    indexesReady = true;
  }
  return db;
}

export async function eventsCol(): Promise<Collection<EventDoc>> {
  return (await getDb()).collection<EventDoc>("events");
}

export async function joinsCol(): Promise<Collection<JoinDoc>> {
  return (await getDb()).collection<JoinDoc>("joins");
}
