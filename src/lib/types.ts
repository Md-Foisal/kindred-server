import type { ObjectId } from "mongodb";

export const EVENT_TYPES = [
  "Cleanup",
  "Plantation",
  "Donation",
  "Food Drive",
  "Blood Donation",
  "Health Camp",
  "Education",
  "Awareness",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export interface EventDoc {
  _id?: ObjectId;
  title: string;
  description: string;
  eventType: EventType;
  thumbnail: string;
  location: string;
  eventDate: Date;
  creatorEmail: string;
  creatorName: string;
  creatorImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JoinDoc {
  _id?: ObjectId;
  eventId: ObjectId;
  userEmail: string;
  userName: string;
  userImage?: string;
  joinedAt: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
}
