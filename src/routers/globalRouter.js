import express from "express";
import { join, login } from "../controllers/userController";
import { recommended } from "../controllers/videoController";

const globalRouter = express.Router();

globalRouter.get("/", recommended);
globalRouter.get("/join", join);
globalRouter.get("/login", login);

export default globalRouter;
