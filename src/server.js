import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
// node module에서 express를 찾아냄.
// === const express = require("express");

const PORT = 3000;

console.log(process.cwd());

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
// express에게 view engine으로 pug를 사용하겠다고 선언.
app.set("views", process.cwd() + "/src/views");
// views의 디렉토리를 /src/views로 변경

app.use(logger);

app.use(express.urlencoded({ extended: true }));
// express app이 form의 value들을 이해할 수 있도록 하고, JS 형식으로 변형시켜줌.

app.use("/", globalRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
// "/"로 시작하는 url에 접근하면 콜백 라우터에 있는 컨트롤러를 찾게 함.

// express app의 내용을 구성하고, app에게 get request에 응답하는 방법 등을 입력

const handleListening = () =>
   console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);
//

app.listen(PORT, handleListening);
// app.listen(포트넘버, 콜백함수);
