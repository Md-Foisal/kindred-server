import { Router } from "express";
import { joinsCol } from "../lib/db.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

// events the logged in user joined, soonest first
router.get("/", verifyToken, async (req, res) => {
  const rows = await (await joinsCol())
    .aggregate([
      { $match: { userEmail: req.user!.email } },
      { $lookup: { from: "events", localField: "eventId", foreignField: "_id", as: "event" } },
      { $unwind: "$event" },
      { $sort: { "event.eventDate": 1 } },
      { $project: { _id: 0, joinId: "$_id", joinedAt: 1, event: 1 } },
    ])
    .toArray();
  res.json(rows);
});

export default router;
