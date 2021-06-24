import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/mytube", {
   useNewUrlParser: true,
   useUnifiedTopology: true,
});

const db = mongoose.connection;

const handleOpen = () => console.log("✅ Connected to DB"),
   handleError = (error) => console.log("❗ DB Error", error);

db.on("error", handleError);
// db가 에러날 때 콘솔로그로 메시징
// .on은 이벤트가 여러번 발생할 수 있음.
db.once("open", handleOpen);
// .once는 오로지 한번만 발생함.

// CRUD === Create, Read, Update, Delete
