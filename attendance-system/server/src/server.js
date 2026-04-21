import app from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";

async function start() {
  await connectDb();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`AttendEase MERN API running on http://localhost:${env.PORT}`);
  });
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", error);
  process.exit(1);
});
