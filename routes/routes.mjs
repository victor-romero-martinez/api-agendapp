//@ts-check
import { Router } from "express";
import { UserController } from "../controllers/user.controller.mjs";

const router = Router();

router.get("/user", UserController.findAll);
router.post("/user", UserController.findOneByEmail);
router.post("/register", UserController.create);

export default router;
