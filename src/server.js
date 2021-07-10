import express from "express";
import morgan from "morgan";
import session from "express-session";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import { localsMiddleware } from "./middlewares";
// node module에서 express를 찾아냄.
// === const express = require("express");

console.log(process.cwd());

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
// express에게 view engine으로 pug를 사용하겠다고 선언.
app.set("views", process.cwd() + "/src/views");
// views의 디렉토리를 /src/views로 변경

app.use(logger);
// 미들웨어 morgan("dev")를 사용.

app.use(express.urlencoded({ extended: true }));
// express app이 form의 value들을 이해할 수 있도록 하고, JS 형식으로 변형시켜줌.

app.use(
   session({
      secret: "Hello!",
      resave: true,
      saveUninitialized: true,
   })
);
// express에서 세션을 사용하기 위한 middleware. 라우터 이전에 써야함.
// 'secret'이란 기억하기 위한 텍스트.

/*
app.use((req, res, next) => {
   req.sessionStore.all((error, sessions) => {
      console.log(sessions);
      next();
   });
});

app.get("/add-one", (req, res, next) => {
   req.session.count += 1;
   return res.send(`${req.session.id}\n${req.session.count}`);
});
*/

app.use(localsMiddleware);
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
// "/"로 시작하는 url에 접근하면 콜백 라우터에 있는 컨트롤러를 찾게 함.

// express app의 내용을 구성하고, app에게 get request에 응답하는 방법 등을 입력

export default app;
