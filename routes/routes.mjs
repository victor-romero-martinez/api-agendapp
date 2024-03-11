/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *      allOf:
 *        - $ref: '#/components/UserEditable'
 *        - $ref: '#/components/UserNoEditable'
 *    Auth:
 *      type: object
 *      required:
 *        - email
 *        - password
 *      properties:
 *        email:
 *          type: string
 *          format: email
 *        password:
 *          type: string
 *          format: password
 *  UserEditable:
 *    type: object
 *    properties:
 *      email:
 *        type: string
 *        format: email
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
import { TaskController } from "../controllers/task.controller.mjs";

/** App router
 * @param {{
 * userModel: import('../models/sqlite/user.model.mjs').User,
 * taskModel: import('../models/sqlite/tasks.model.mjs').Task
 * }} param
 */
export const appRouter = ({ userModel, taskModel }) => {
  const router = Router();

  const authController = new AuthController({ userModel });
  const userController = new UserController({ userModel });
  const taskController = new TaskController({ taskModel });

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
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/User'
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
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/User'
   *      404:
   *        description: User does not exists.
   *      500:
   *        description: Internal Server Error.
   */
  router.post("/user", userController.getByEmail);
  /**
   * @swagger
   * /user:
   *  patch:
   *    summary: Update a profile
   *    tags: [User]
   *    produces:
   *      - application/json
   *    security:
   *      - cookieAuth: []
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/UserEditable'
   *    responses:
   *      200:
   *        description: Response with user Updated.
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/User'
   *      400:
   *        description: Bad Request.
   *      404:
   *        description: Missing user email.
   *      500:
   *        description: Internal Server Error.
   */
  router.patch("/user", jwtMiddleware, userController.update);
  /**
   * @swagger
   * /user:
   *  delete:
   *    summary: Disable profile
   *    tags: [User]
   *    produces:
   *      - application/json
   *    security:
   *      - cookieAuth: []
   *    parameters:
   *      - in: query
   *        name: id
   *        schema:
   *          type: string
   *          format: number
   *          description: Id of profile
   *    responses:
   *      200:
   *        description: Response profile disable.
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                message:
   *                  type: string
   *      404:
   *        description: User not found.
   *      500:
   *        description: Internal Sever Error.
   */
  router.delete("/user", jwtMiddleware, userController.delete);

  // AUTH
  /**
   * @swagger
   * /register:
   *  post:
   *    summary: Register an account
   *    tags: [Auth]
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
   *              password:
   *                type: string
   *    responses:
   *      201:
   *        description: Response with new user
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/User'
   *      400:
   *        description: Email is already exist
   *      404:
   *        description: Not Found
   *      500:
   *        description: Internal Server Error.
   */
  router.post("/register", authController.register);
  /**
   * @swagger
   * /signing:
   *  post:
   *    summary: Signing to get auth
   *    tags: [Auth]
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
   *              password:
   *                type: string
   *    responses:
   *      200:
   *        description: Get session auth
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/User'
   *      404:
   *        description: Not Found
   *      401:
   *        description: Incorrect password or email
   *      500:
   *        description: Internal Server Error
   */
  router.post("/signing", authController.signing);
  /**
   * @swagger
   * /signout:
   *  get:
   *    summary: Close session
   *    tags: [Auth]
   *    responses:
   *      200:
   *        description: Successfully
   */
  router.get("/signout", authController.signout);

  // TASKS
  router.get("/task/:id", taskController.getByAuthor);
  router.get("/task", taskController.getAll);

  return router;
};
