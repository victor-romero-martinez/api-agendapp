// @ts-check
import cors from "cors";

const ACCEPT_ORIGINS = ["http://localhost:3000"];

export const corsMiddleware = ({ acceptOrigins = ACCEPT_ORIGINS } = {}) => {
  return cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (acceptOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS."));
    },
  });
};
