const form = document.getElementById("commentForm");
const textarea = form.querySelector("textarea");
const btn = form.querySelector("button");
const videoContainor = document.getElementById("videoContainer");

const handleSubmit = (event) => {
   event.preventDefault();
   const video = videoContainor.dataset.id;
   // 해당 video의 id
   const text = textarea.value;
};

form.addEventListener("submit", handleSubmit);
// form의 method나 action이 있기 때문에 btn-click event 감지 대신, form의 submit 감지.
