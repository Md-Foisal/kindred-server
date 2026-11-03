import { Router } from "express";
import { eventsCol, joinsCol } from "../lib/db.js";
import { toObjectId } from "../lib/ids.js";
import { EVENT_TYPES } from "../lib/types.js";

const router = Router();

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// public list, only events that did not happen yet
router.get("/", async (req, res) => {
  const filter: Record<string, unknown> = { eventDate: { $gte: new Date() } };

  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ title: rx }, { location: rx }];
  }

  const type = typeof req.query.type === "string" ? req.query.type : "";
  if (type && (EVENT_TYPES as readonly string[]).includes(type)) {
    filter.eventType = type;
  }

  const events = await (await eventsCol()).find(filter).sort({ eventDate: 1 }).toArray();
  res.json(events);
});

// home page section, the 6 closest upcoming events
router.get("/recent", async (_req, res) => {
  const events = await (await eventsCol())
    .find({ eventDate: { $gte: new Date() } })
    .sort({ eventDate: 1 })
    .limit(6)
    .toArray();
  res.json(events);
});

router.get("/:id", async (req, res) => {
  const _id = toObjectId(req.params.id);
  if (!_id) return res.status(400).json({ message: "Invalid event id" });

  const event = await (await eventsCol()).findOne({ _id });
  if (!event) return res.status(404).json({ message: "Event not found" });

  const joinedCount = await (await joinsCol()).countDocuments({ eventId: _id });
  res.json({ ...event, joinedCount });
});

export default router;
