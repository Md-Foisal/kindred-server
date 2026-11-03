import { Router } from "express";
import { eventsCol, joinsCol } from "../lib/db.js";
import { toObjectId } from "../lib/ids.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

router.get("/:id/join-status", verifyToken, async (req, res) => {
  const _id = toObjectId(req.params.id);
  if (!_id) return res.status(400).json({ message: "Invalid event id" });

  const found = await (await joinsCol()).findOne({ eventId: _id, userEmail: req.user!.email });
  res.json({ joined: Boolean(found) });
});

router.post("/:id/join", verifyToken, async (req, res) => {
  const _id = toObjectId(req.params.id);
  if (!_id) return res.status(400).json({ message: "Invalid event id" });

  const event = await (await eventsCol()).findOne({ _id });
  if (!event) return res.status(404).json({ message: "Event not found" });
  if (event.eventDate.getTime() < Date.now()) {
    return res.status(400).json({ message: "This event is already over" });
  }
  if (event.creatorEmail === req.user!.email) {
    return res.status(400).json({ message: "You are the host of this event" });
  }

  const joins = await joinsCol();
  if (await joins.findOne({ eventId: _id, userEmail: req.user!.email })) {
    return res.status(409).json({ message: "You already joined this event" });
  }

  try {
    await joins.insertOne({
      eventId: _id,
      userEmail: req.user!.email,
      userName: req.user!.name,
      userImage: req.user!.image,
      joinedAt: new Date(),
    });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      return res.status(409).json({ message: "You already joined this event" });
    }
    throw err;
  }
  res.status(201).json({ message: "Joined the event" });
});

router.delete("/:id/join", verifyToken, async (req, res) => {
  const _id = toObjectId(req.params.id);
  if (!_id) return res.status(400).json({ message: "Invalid event id" });

  const result = await (await joinsCol()).deleteOne({ eventId: _id, userEmail: req.user!.email });
  if (!result.deletedCount) return res.status(404).json({ message: "You have not joined this event" });
  res.json({ message: "You left the event" });
});

export default router;
