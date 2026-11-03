import cors from "cors";
import express from "express";
import { config } from "./lib/config.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import eventsRouter from "./routes/events.js";
import joinRouter from "./routes/join.js";
import joinedRouter from "./routes/joined.js";
import manageRouter from "./routes/manage.js";

const app = express();

app.use(cors({ origin: [config.clientUrl, "http://localhost:3000"] }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ name: "Kindred API", status: "running" });
});

// manage first so /mine is not caught by /:id
app.use("/api/events", manageRouter);
app.use("/api/events", joinRouter);
app.use("/api/events", eventsRouter);
app.use("/api/joined", joinedRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
