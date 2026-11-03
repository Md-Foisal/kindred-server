import { Router } from "express";
import { eventsCol, joinsCol } from "../lib/db.js";
import { toObjectId } from "../lib/ids.js";
import type { EventDoc } from "../lib/types.js";
import { createEventSchema, firstIssue, updateEventSchema } from "../lib/validate.js";
import { verifyToken } from "../middleware/verifyToken.js";

// everything here needs a logged in user, and update/delete only for the owner
const router = Router();

router.get("/mine", verifyToken, async (req, res) => {
  const events = await (await eventsCol())
    .find({ creatorEmail: req.user!.email })
    .sort({ eventDate: 1 })
    .toArray();
  res.json(events);
});

router.post("/", verifyToken, async (req, res) => {
  const parsed = createEventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: firstIssue(parsed.error) });

  const now = new Date();
  const doc: EventDoc = {
    ...parsed.data,
    creatorEmail: req.user!.email,
    creatorName: req.user!.name,
    creatorImage: req.user!.image,
    createdAt: now,
    updatedAt: now,
  };

  const result = await (await eventsCol()).insertOne(doc);
  res.status(201).json({ insertedId: result.insertedId });
});

router.patch("/:id", verifyToken, async (req, res) => {
  const _id = toObjectId(req.params.id);
  if (!_id) return res.status(400).json({ message: "Invalid event id" });

  const col = await eventsCol();
  const event = await col.findOne({ _id });
  if (!event) return res.status(404).json({ message: "Event not found" });
  if (event.creatorEmail !== req.user!.email) {
    return res.status(403).json({ message: "You can only update your own events" });
  }

  // if the date was not changed we dont check it again, so a finished event can still get a typo fix
  const body = { ...req.body };
  if (body.eventDate && new Date(body.eventDate).getTime() === event.eventDate.getTime()) {
    delete body.eventDate;
  }

  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) return res.status(400).json({ message: firstIssue(parsed.error) });

  await col.updateOne({ _id }, { $set: { ...parsed.data, updatedAt: new Date() } });
  res.json({ message: "Event updated" });
});

router.delete("/:id", verifyToken, async (req, res) => {
  const _id = toObjectId(req.params.id);
  if (!_id) return res.status(400).json({ message: "Invalid event id" });

  const col = await eventsCol();
  const event = await col.findOne({ _id });
  if (!event) return res.status(404).json({ message: "Event not found" });
  if (event.creatorEmail !== req.user!.email) {
    return res.status(403).json({ message: "You can only delete your own events" });
  }

  await col.deleteOne({ _id });
  await (await joinsCol()).deleteMany({ eventId: _id });
  res.json({ message: "Event deleted" });
});

export default router;
