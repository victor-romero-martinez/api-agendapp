import "dotenv/config";
import sqlite3 from "sqlite3";
import { logHelper } from "../../utils/log-helper.mjs";

export const db = new sqlite3.Database(process.env.DATABASE_URL, (err) => {
  if (err) {
    logHelper("error ☠", err);
  }

  logHelper("success 🎉", "Connected to db");
});
