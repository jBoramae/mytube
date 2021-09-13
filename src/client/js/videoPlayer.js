const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = (e) => {
   if (video.paused) {
      // if the video is playing, pause it, else play the video
      video.play();
   } else {
      // else play the video
      video.pause();
   }

   playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
   // video.pause() = method/punction, video.paused = property
};

const handleMute = (e) => {
   if (video.muted) {
      video.muted = false;
   } else {
      video.muted = true;
   }

   muteBtnIcon.classList = video.muted
      ? "fas fa-volume-mute"
      : "fas fa-volume-up";
   volumeRange.value = video.muted ? "0" : volumeValue;
};

const handleVolumeChange = (event) => {
   const {
      target: { value },
   } = event;

   if (video.muted) {
      video.muted = false;
      muteBtn.innerText = "Mute";
   }

   volumeValue = value;
   video.volume = value;
};

const formatTime = (sec) => new Date(sec * 1000).toISOString().substr(14, 5);

const handleLoadedMetadata = () => {
   // config video's totaltime
   totalTime.innerText = formatTime(Math.floor(video.duration));

   // config video's max of timeline
   timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
   // config video's currenttime
   currentTime.innerText = formatTime(Math.floor(video.currentTime));

   // config timeline along with currenttime
   timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
   const {
      target: { value },
   } = event;

   video.currentTime = value;
};

const handleFullScreen = () => {
   const fullscreen = document.fullscreenElement;

   if (fullscreen) {
      document.exitFullscreen();
      fullScreenIcon.classList = "fas fa-expand";
   } else {
      videoContainer.requestFullscreen();
      fullScreenIcon.classList = "fas fa-compress";
   }
};

const hideControls = () => {
   videoControls.classList.remove("showing");
};

const handleMouseMove = () => {
   if (controlsTimeout) {
      clearTimeout(controlsTimeout);
      controlsTimeout = null;
   }
   // 마우스가 나간 뒤, 다시 들어오면 setTimeout을 초기화하고 전역변수에 저장.

   if (controlsMovementTimeout) {
      clearTimeout(controlsMovementTimeout);
      controlsMovementTimeout = null;
   }

   videoControls.classList.add("showing");
   controlsMovementTimeout = setTimeout(hideControls, 3000);
   /*
   타임아웃 설정 => 마우스가 움직여서 handleMouseMove가 다시 활성화되면
   showing 클래스 다시 추가하고, 타임아웃 재설정 => 반복
   */
};

const handleMouseLeave = () => {
   controlsTimeout = setTimeout(hideControls, 3000);
   // 마우스가 떠났을 때
};

const handleKeyDown = (event) => {
   const { code } = event;

   // 키다운 이벤트시 다른 기능적 문제에 대해서 조정 필요함
   if (code == "ArrowRight") {
      video.currentTime += 5;
   } else if (code == "ArrowLeft") {
      if (video.currentTime >= 5) {
         video.currentTime -= 5;
      } else {
         video.currentTime = 0;
      }
   } else if (code == "Space") {
      handlePlayClick();
   }
};

const handleEnded = () => {
   const { id } = videoContainer.dataset;
   fetch(`/api/videos/${id}/view`, {
      method: "POST",
   });
   // 기본적으로 fetch의 default method == "GET"
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
video.addEventListener("click", handlePlayClick);
video.addEventListener("dblclick", handleFullScreen);
window.addEventListener("keydown", handleKeyDown);
