import express from "express";
// node module에서 express를 찾아냄.
// === const express = require("express");

const PORT = 4000;

const app = express();
// express app 생성

const handleListening = () =>
   console.log(`Server listening on port http://localhost:${PORT} 🚀`);
//

app.listen(PORT, handleListening);
// app.listen(포트넘버, 콜백함수);
