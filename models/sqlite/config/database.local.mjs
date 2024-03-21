import "dotenv/config";
import sqlite3 from "sqlite3";
import { logHelper } from "../../../utils/log-helper.mjs";

const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  throw Error("Missing database url .env");
}

export const db = new sqlite3.Database(DB_URL, (err) => {
  if (err) {
    return logHelper(err);
  }

  logHelper("Connected to db", "success 🎉");
});
