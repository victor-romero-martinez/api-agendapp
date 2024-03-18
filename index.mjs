//@ts-check
import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import swaggerUI from "swagger-ui-express";
import { specs } from "./config/swagger.mjs";
import { corsMiddleware } from "./middlewares/cors.middleware.mjs";
import { appRouter } from "./routes/routes.mjs";
import { logHelper } from "./utils/log-helper.mjs";

/** App index
 * @param {{
 * userModel: import('./models/sqlite/user.model.mjs').User,
 * taskModel: import('./models/sqlite/tasks.model.mjs').Task,
 * dashboardModel: import('./models/sqlite/dashboard.model.mjs').Dashboard
 * }} param
 */
export const createApp = ({ userModel, taskModel, dashboardModel }) => {
  const app = express();

  const PORT = process.env.PORT ?? 3000;
  const VERSION = process.env.API_VERSION ?? "v1";
  const HOST = process.env.URL_BASE ?? "http:localhost";

  app.disable("x-powered-by");
  app.use(express.json());
  app.use(cookieParser());
  app.use(corsMiddleware());

  app.use(
    `/api/${VERSION}`,
    appRouter({ userModel, taskModel, dashboardModel })
  );
  app.use(`/api/${VERSION}/docs`, swaggerUI.serve, swaggerUI.setup(specs));

  app.listen(PORT, () => {
    logHelper("info ✨", `App Listening on ${HOST}:${PORT}/api/${VERSION}`);
  });
};
