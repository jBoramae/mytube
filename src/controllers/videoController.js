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

/* ===== Promise Style =====
   const videos = await Video.find({});
   await를 find 앞에 적으면 callback이 필요 없음을 인식하고 찾아낸 Video를 바로 출력함.
   callback style 처럼 여기저기 가지 않고, 순서대로 cascading 됨. === 직관적
*/

export const home = async (req, res) => {
   const videos = await Video.find({}).sort({ createdAt: "desc" });
   return res.render("home", { pageTitle: "Home", videos });
};

/* 
   res.render("home"); 에서 에러가 생기는 이유: 디렉토리가 잘못됨.
   mytube의 package.json에서 node.js를 실행하고 있기 때문에, 디렉토리가 /src가 아닌 /mytube가 됨.

   그러므로 server.js에서 app.set("views", process.cwd() + "/src/views"); 입력해서 경로 변경. */

export const watch = async (req, res) => {
   const { id } = req.params;
   // const { id } = req.params === const id = req.params.id; :: ES6 style
   const video = await Video.findById(id);

   if (!video) {
      return res.render("404", { pageTitle: "Video not found." });
   }

   return res.render("watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
   const { id } = req.params;
   const video = await Video.findById(id);

   if (!video) {
      return res.render("404", { pageTitle: "Video not found." });
   }

   res.render("edit", { pageTitle: `Editing: ${video.title}`, video });
};

export const postEdit = async (req, res) => {
   const { id } = req.params;
   const { title, description, hashtags } = req.body;
   const video = await Video.exists({ _id: id });

   if (!video) {
      return res.render("404", { pageTitle: "Video not found." });
   }

   await Video.findByIdAndUpdate(id, {
      title,
      description,
      hashtags: Video.formatHashtags(hashtags),
   });

   return res.redirect(`/videos/${id}`);
};
/* 유저가 getEdit으로 이동, form을 render, 유저가 submit시 post.req로 이동,
   postEdit이 처리, postEdit은 route로부터 id를 얻어서, `/videos/${id}`로 redirect */

// input(name="") 없으면 return 받을 수 없음.

export const getUpload = (req, res) => {
   return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
   // here we'll add a video to the videos array.
   const { title, description, hashtags } = req.body;

   try {
      await Video.create({
         title,
         description,
         hashtags: Video.formatHashtags(hashtags),
      });
      return res.redirect("/");
   } catch (error) {
      return res.render("upload", {
         pageTitle: "Upload Video",
         errorMessage: error._message,
      });
   }
};
/*
   save >> promise를 return === save 작업이 끝날 때까지 기다려줘야 함.
   why: DB에 기록 및 저장되는데 시간이 걸리기 때문. >> async와 await를 사용해서 기다림.

   const video = new Video({
      title,
      description,
      createdAt: Date.now(),
      hashtags: hashtags.split(",").map((word) => `#${word}`),
      meta: {
         views: 0,
         rating: 0,
      },
   });
   await video.save();
*/

export const deleteVideo = async (req, res) => {
   const { id } = req.params;

   await Video.findByIdAndDelete(id);
   // === findOneAndDelete({ _id : id })

   return res.redirect("/");
};

export const search = async (req, res) => {
   const { keyword } = req.query;
   let videos = [];

   if (keyword) {
      videos = await Video.find({
         title: {
            $regex: new RegExp(keyword, "i"),
         },
      });
   }

   return res.render("search", { pageTitle: "Search", videos });
};
