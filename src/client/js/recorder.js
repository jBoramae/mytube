const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const handleDownload = () => {
   const anc = document.createElement("a");
   anc.href = videoFile;
   anc.download = "MyRecording.webm";
   document.body.appendChild(anc);
   anc.click();
   // a.click(): 사용자가 링크를 클릭한 것처럼 작동
};

const handleStop = () => {
   startBtn.innerText = "Download Recording";
   startBtn.removeEventListener("click", handleStop);
   startBtn.addEventListener("click", handleDownload);

   recorder.stop();
};

const handleStart = () => {
   startBtn.innerText = "Stop Recording";
   startBtn.removeEventListener("click", handleStart);
   startBtn.addEventListener("click", handleStop);

   recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

   recorder.ondataavailable = (event) => {
      videoFile = URL.createObjectURL(event.data);
      video.srcObject = null;
      video.src = videoFile;
      video.loop = true;
      video.play();
      //createObjectURL: 브라우저 메모리에서만 가능한 URL 생성
   };
   recorder.start();
};

const init = async () => {
   stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
   });

   video.srcObject = stream;
   video.play();
};

init();

startBtn.addEventListener("click", handleStart);
