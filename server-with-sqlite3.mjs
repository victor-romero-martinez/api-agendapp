import { createApp } from "./index.mjs";
import { User } from "./models/sqlite/user.model.mjs";

createApp({ model: User });
