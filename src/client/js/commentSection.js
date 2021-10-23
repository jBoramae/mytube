const videoContainor = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const delComment = (arg) => {};

const handleDelete = async (event) => {
   const comment = event.target.parentNode;
   const commentId = comment.dataset.id;
   console.log(comment.dataset);
};

const addComment = (text, id) => {
   const videoComments = document.querySelector(".video__comments ul");
   const newComment = document.createElement("li");
   newComment.dataset.id = id;
   newComment.className = "video__comment";

   const icon = document.createElement("i");
   icon.className = "fas fa-comment";

   const textSpan = document.createElement("span");
   textSpan.innerText = ` ${text}`;

   const delSpan = document.createElement("span");
   delSpan.innerText = " ✖";
   delSpan.className = "deleteBtn";

   newComment.appendChild(icon);
   newComment.appendChild(textSpan);
   newComment.appendChild(delSpan);

   videoComments.prepend(newComment);
   delSpan.addEventListener("click", handleDelete);
   // append: 뒤에(아래) 추가함 <=> prepend: 앞에(위) 추가함.
};

const handleSubmit = async (event) => {
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
    *
    * => await fetch?
    * fetch는 backend로 가야하고,
    * backend는 DB랑 뭔가를 하고 나서, status code를 return 하고
    * 그러고나서 backend가 우리에게 돌아옴.
    *    => 이 과정에서 시간이 걸리므로 await 사용.
    *
    * await가 없어도 작동하지만,
    * 이를테면 reload를 했는데 fetch가 끝나지 않았다면
    * fetch가 backend로 갔다가 돌아올 만큼 시간이 충분하지 못한 것임.
    *
    * fetch: promise를 return 함 => 끝나는데 시간이 필요.
    */
   const response = await fetch(`/api/videos/${videoId}/comment`, {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
   });

   if (response.status === 201) {
      textarea.value = "";
      const { newCommentId } = await response.json();
      addComment(text, newCommentId);
   }
};

if (form) {
   form.addEventListener("submit", handleSubmit);
}

if (document.querySelector(".deleteBtn")) {
   const elem = document.querySelectorAll(".deleteBtn");
   for (let e of elem) {
      e.addEventListener("click", handleDelete);
   }
   console.log(elem);
}

// form의 method나 action이 있기 때문에 btn-click event 감지 대신, form의 submit 감지.
