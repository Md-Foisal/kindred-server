import app from "./app.js";
import { config } from "./lib/config.js";

// on vercel the app is used as a function, locally we start a normal server
if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`Kindred API running on port ${config.port}`);
  });
}

export default app;
