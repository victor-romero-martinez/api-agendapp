import "dotenv/config";
import sqlite3 from "sqlite3";
import { logHelper } from "../../../utils/log-helper.mjs";

const DB_URL = process.env.DATABASE_URL;

export const db = new sqlite3.Database(DB_URL, (err) => {
  if (err) {
    return logHelper("error ☠", err);
  }

  logHelper("success 🎉", "Connected to db");
});
