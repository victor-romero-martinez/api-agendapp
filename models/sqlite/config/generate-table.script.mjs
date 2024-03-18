import { logHelper } from "../../../utils/log-helper.mjs";
import { db } from "./database.local.mjs";
import fs from "fs";

(() => {
  const query = fs.readFileSync("./models/sqlite/config/query.sql", {
    encoding: "utf-8",
  });

  db.serialize(() => {
    db.exec(query, (err) => {
      if (err) {
        logHelper("error ☠", err);
      } else {
        logHelper("success 🎉", "Query executed successfully");
      }
    });
  });
})();
