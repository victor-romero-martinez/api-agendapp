import { createApp } from "./index.mjs";
import { User } from "./models/sqlite/user.model.mjs";

const userModel = new User();

createApp({ model: userModel });
