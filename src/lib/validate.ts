import { z } from "zod";
import { EVENT_TYPES } from "./types.js";

const futureDate = z.coerce
  .date({ error: "Event date is not valid" })
  .refine((d) => d.getTime() > Date.now(), { message: "Event date must be in the future" });

export const createEventSchema = z.object({
  title: z.string().trim().min(5, "Title needs at least 5 characters").max(100),
  description: z.string().trim().min(20, "Description needs at least 20 characters").max(2000),
  eventType: z.enum(EVENT_TYPES, { error: "Pick a valid event type" }),
  thumbnail: z.url({ error: "Thumbnail must be a valid image URL" }),
  location: z.string().trim().min(3, "Location is too short").max(150),
  eventDate: futureDate,
});

export const updateEventSchema = createEventSchema.partial();

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid data";
}
