//@ts-check
import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import { appRouter } from "./routes/routes.mjs";

/** App index
 * @param {{ model: user }} param
 */
export const createApp = ({ model }) => {
  const app = express();

  const PORT = process.env.PORT ?? 3000;
  const VERSION = process.env.API_VERSION ?? "v1";

  app.disable("x-powered-by");
  app.use(express.json());
  app.use(cookieParser());

  app.use(`/api/${VERSION}`, appRouter({ model }));

  app.listen(PORT, () => {});
};

/** @typedef {import('./models/sqlite/user.model.mjs').User} user */
