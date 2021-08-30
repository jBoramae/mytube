import express from "express";
import {
   postEdit,
   see,
   logout,
   startGithubLogin,
   finishGithubLogin,
   getEdit,
   getChangePassword,
   postChangePassword,
} from "../controllers/userController";
import {
   protectorMiddleware,
   publicOnlyMiddleware,
   avatarUpload,
} from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);

userRouter
   .route("/edit")
   .all(protectorMiddleware)
   .get(getEdit)
   .post(avatarUpload.single("avatar"), postEdit);

userRouter
   .route("/change-password")
   .all(protectorMiddleware)
   .get(getChangePassword)
   .post(postChangePassword);

userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);

userRouter.get("/:id", see);
// user가 Github에서 돌아오면 /github/finish?code=1332323 같은 내용이 덧붙여진 URL을 받음.
// 이 code는 user가 승인했다고 Github가 알려주는 것임.

export default userRouter;
