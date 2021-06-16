import express from "express";
import morgan from "morgan";
// node module에서 express를 찾아냄.
// === const express = require("express");

const PORT = 4000;

const app = express();
const logger = morgan("dev");
// express app 생성

const home = (req, res) => {
   console.log("I'll respond.");
   return res.send("Hello, world!");
};

app.use(logger);
app.get("/", home);

// express app의 내용을 구성하고, app에게 get request에 응답하는 방법 등을 입력

const handleListening = () =>
   console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);
//

app.listen(PORT, handleListening);
// app.listen(포트넘버, 콜백함수);
