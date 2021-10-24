import express from "express";
import {
   registerView,
   createComment,
   deleteComment,
} from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);
apiRouter.delete(
   "/videos/:id([0-9a-f]{24})/comment/:id([0-9a-f]{24})",
   deleteComment
);

export default apiRouter;
// user가 영상 시청 => send request => URL 안 바꿈 & 템플링 렌더링 X
