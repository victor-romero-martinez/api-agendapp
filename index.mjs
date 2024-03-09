//@ts-check
import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import swaggerUI from "swagger-ui-express";
import { specs } from "./config/swagger.mjs";
import { corsMiddleware } from "./middlewares/cors.middleware.mjs";
import { appRouter } from "./routes/routes.mjs";

/** App index
 * @param {{ userModel: user }} param
 */
export const createApp = ({ userModel }) => {
  const app = express();

  const PORT = process.env.PORT ?? 3000;
  const VERSION = process.env.API_VERSION ?? "v1";

  app.disable("x-powered-by");
  app.use(express.json());
  app.use(cookieParser());
  app.use(corsMiddleware());

  app.use(`/api/${VERSION}`, appRouter({ userModel }));
  app.use(`/api/${VERSION}/docs`, swaggerUI.serve, swaggerUI.setup(specs));

  app.listen(PORT, () => {});
};

/** @typedef {import('./models/sqlite/user.model.mjs').User} user */
