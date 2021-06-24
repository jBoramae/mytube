import Video from "../models/Video";

/* ===== Callback Style =====
   Video.find({}, (error, videos) => {
      if(error){
         return res.render("server-error");
      }
      return res.render("home", { pageTitle: "Home", videos });
   });
   데이터베이스 검색이 끝나야 render가 됨: db 검색이 안 끝났을때 render 되는걸 방지하기 위함.
   callback의 장점은 err들을 여기에서 바로 확인 가능.
*/

export const home = async (req, res) => {
   const videos = await Video.find({});
   return res.render("home", { pageTitle: "Home", videos });
};

/* 
   res.render("home"); 에서 에러가 생기는 이유: 디렉토리가 잘못됨.
   mytube의 package.json에서 node.js를 실행하고 있기 때문에, 디렉토리가 /src가 아닌 /mytube가 됨.

   그러므로 server.js에서 app.set("views", process.cwd() + "/src/views"); 입력해서 경로 변경. */

/* ===== Promise Style =====
   const videos = await Video.find({});
   await를 find 앞에 적으면 callback이 필요 없음을 인식하고 찾아낸 Video를 바로 출력함.
   callback style 처럼 여기저기 가지 않고, 순서대로 cascading 됨. === 직관적
*/

export const watch = (req, res) => {
   const { id } = req.params;
   return res.render("watch", { pageTitle: `Watching: ` });
};
// const { id } = req.params === const id = req.params.id; :: ES6 style

export const getEdit = (req, res) => {
   const { id } = req.params;
   res.render("edit", { pageTitle: `Editing: ` });
};
export const postEdit = (req, res) => {
   const { id } = req.params;
   const { title } = req.body;
   return res.redirect(`/videos/${id}`);
};
/* 유저가 getEdit으로 이동, form을 render, 유저가 submit시 post.req로 이동,
   postEdit이 처리, postEdit은 route로부터 id를 얻어서, `/videos/${id}`로 redirect */

// input(name="") 없으면 return 받을 수 없음.

export const getUpload = (req, res) => {
   return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = (req, res) => {
   // here we'll add a video to the videos array.
   const { title } = req.body;

   return res.redirect("/");
};
