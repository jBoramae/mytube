const videoContainor = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const handleSubmit = (event) => {
   event.preventDefault();
   const textarea = form.querySelector("textarea");
   const text = textarea.value;
   const videoId = videoContainor.dataset.id;
   // 해당 video의 id

   // 사용자가 아무것도 보내지않으면 전송 X
   if (text === "") {
      return;
   }

   /**
    * fetch: (URL 변경없이) JS를 통해 request를 보낼 수 있게 만듦
    * headers: request에 대한 정보를 담고 있음.
    * body: 전달하려는 것 => req.body
    * body: JSON.stringify({ text })
    *    === JSON.stringify({ text: text })
    */
   fetch(`/api/videos/${videoId}/comment`, {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
   });

   textarea.value = "";
};

if (form) {
   form.addEventListener("submit", handleSubmit);
}

// form의 method나 action이 있기 때문에 btn-click event 감지 대신, form의 submit 감지.
