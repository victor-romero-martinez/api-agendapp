//@ts-check
import { Router } from "express";
import { UserController } from "../controllers/user.controller.mjs";

/** App router */
export const appRouter = ({ model }) => {
  const router = Router();

  const controller = new UserController({ model });

  router.get("/user", controller.findAll);
  router.post("/user", controller.findOneByEmail);
  router.post("/register", controller.create);

  return router;
};
