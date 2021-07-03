import "./db";
import "./models/Video";
import "./models/User";
import app from "./server";

const PORT = 3600;

const handleListening = () =>
   console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);
//

app.listen(PORT, handleListening);
// app.listen(포트넘버, 콜백함수);
