/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *      allOf:
 *        - $ref: '#/components/UserEditable'
 *        - $ref: '#/components/UserNoEditable'
 *  UserEditable:
 *    type: object
 *    properties:
 *      email:
 *        type: string
 *        format: email
 *      password:
 *        type: string
 *        format: password
 *      user_name:
 *        type: string
 *        format: name
 *      url_img:
 *        type: string
 *        format: uri
 *  UserNoEditable:
 *    type: object
 *    properties:
 *      id:
 *        type: number
 *        format: int64
 *      role:
 *        type: string
 *      active:
 *        type: string
 *        format: boolean
 *        default: true
 *      verify:
 *        type: string
 *        format: bolean
 *        default: false
 *      token_email:
 *        type: string
 *        format: uuid
 *      updated_ad:
 *        type: string
 *        format: date
 *      created_ad:
 *        type: string
 *        format: date
 */
//@ts-check
import { Router } from "express";
import { UserController } from "../controllers/user.controller.mjs";
import { AuthController } from "../controllers/auth.controller.mjs";
import jwtMiddleware from "../middlewares/jwt.middleware.mjs";

/** App router
 * @param {{ model: user }} param
 */
export const appRouter = ({ model }) => {
  const router = Router();

  const authController = new AuthController({ model });
  const userController = new UserController({ model });

  /**
   * @swagger
   * /user:
   *  get:
   *    summary: Get all Users
   *    tags: [User]
   *    produces:
   *      - application/json
   *    responses:
   *      200:
   *        description: Response with all user
   *        content:
   *          schema:
   *            type: array
   *            items:
   *              $ref: '#/components/schemas/User'
   *      500:
   *        description: Internal Server Error.
   */
  router.get("/user", userController.findAll);
  /**
   * @swagger
   * /user:
   *  post:
   *    summary: Get a user by email
   *    tags: [User]
   *    produces:
   *      - application/json
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              email:
   *                type: string
   *                format: email
   *    responses:
   *      200:
   *        description: Response a user.
   *        content:
   *          schema:
   *            type: object
   *            items:
   *              $ref: '#/components/schemas/User'
   *      404:
   *        description: User does not exists.
   *      500:
   *        description: Internal Server Error.
   */
  router.post("/user", userController.getByEmail);
  router.patch("/user", jwtMiddleware, userController.update);
  router.delete("/user", jwtMiddleware, userController.delete);

  router.post("/register", authController.register);
  router.post("/signing", authController.signing);
  router.get("/signout", authController.signout);

  return router;
};

/** @typedef {import('../models/sqlite/user.model.mjs').User} user */
