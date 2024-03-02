import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import router from "./routes/routes.mjs";

const app = express();

const PORT = process.env.PORT ?? 3000;
const VERSION = process.env.API_VERSION ?? "v1";

app.disable("x-powered-by");
app.use(express.json());
app.use(cookieParser());

app.use(`/api/${VERSION}`, router);

app.listen(PORT, () => {
  console.log(`App running on: http://localhost:${PORT}`);
});
