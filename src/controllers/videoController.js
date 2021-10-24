import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";
import { async } from "regenerator-runtime";

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
   const videos = await Video.find({})
      .sort({ createdAt: "desc" })
      .populate("owner");
   return res.render("home", { pageTitle: "Home", videos });
};

/* 
   res.render("home"); 에서 에러가 생기는 이유: 디렉토리가 잘못됨.
   mytube의 package.json에서 node.js를 실행하고 있기 때문에, 디렉토리가 /src가 아닌 /mytube가 됨.

   그러므로 server.js에서 app.set("views", process.cwd() + "/src/views"); 입력해서 경로 변경. */

export const watch = async (req, res) => {
   const { id } = req.params;
   const video = await Video.findById(id)
      .populate("owner")
      .populate("comments");
   // .populate("owner") === mongoose를 이용해 owner를 string이 아닌 origin data object로 제공함.

   if (!video) {
      return res.status(404).render("404", { pageTitle: "Video not found." });
   }

   return res.render("watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
   const { id } = req.params;
   const {
      user: { _id },
   } = req.session;
   const video = await Video.findById(id);

   if (!video) {
      return res.status(404).render("404", { pageTitle: "Video not found." });
   }

   if (String(video.owner) !== String(_id)) {
      req.flash("error", "You're not the owner of the video.");
      return res.status(403).redirect("/");
      // status(403) === Forbidden
   }

   res.render("edit", { pageTitle: `Editing: ${video.title}`, video });
};

export const postEdit = async (req, res) => {
   const { id } = req.params;
   const {
      user: { _id },
   } = req.session;
   const { title, description, hashtags } = req.body;
   const video = await Video.exists({ _id: id });

   if (!video) {
      return res.status(404).render("404", { pageTitle: "Video not found." });
   }

   if (String(video.owner) !== String(_id)) {
      return res.status(403).redirect("/");
      // status(403) === Forbidden
   }

   await Video.findByIdAndUpdate(id, {
      title,
      description,
      hashtags: Video.formatHashtags(hashtags),
   });

   req.flash("Success", "Change saved.");
   return res.redirect(`/videos/${id}`);
};
/* 유저가 getEdit으로 이동, form을 render, 유저가 submit시 post.req로 이동,
   postEdit이 처리, postEdit은 route로부터 id를 얻어서, `/videos/${id}`로 redirect */

// input(name="") 없으면 return 받을 수 없음.

export const getUpload = (req, res) => {
   return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
   const {
      user: { _id },
   } = req.session;
   const { path: fileUrl } = req.file;
   const { title, description, hashtags } = req.body;

   try {
      const newVideo = await Video.create({
         title,
         description,
         fileUrl,
         owner: _id,
         hashtags: Video.formatHashtags(hashtags),
      });

      const user = await User.findById(_id);
      user.videos.push(newVideo._id);
      user.save();
      // userSchema.pre("save") 때문에 hash 일어남 >> fix bug

      return res.redirect("/");
   } catch (error) {
      return res.status(400).render("upload", {
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
   const {
      user: { _id },
   } = req.session;
   const video = await Video.findById(id);

   if (!video) {
      return res.status(404).render("404", { pageTitle: "Video not found." });
   }

   if (String(video.owner) !== String(_id)) {
      return res.status(403).redirect("/");
      // status(403) === Forbidden
   }

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
            // MongoDB에서 지원하는 정규표현식 옵션. i: 대소문자 구분X.
         },
      }).populate("owner");
   }

   return res.render("search", { pageTitle: "Search", videos });
};

export const registerView = async (req, res) => {
   const { id } = req.params;
   const video = await Video.findById(id);
   if (!video) {
      return res.sendStatus(404);
   }

   video.meta.views += 1;
   await video.save();

   return res.sendStatus(200);
   // status code 200: Okay
};

export const createComment = async (req, res) => {
   // cookie 덕분에 req.session.user를 불러올 수 있음.
   const {
      session: { user },
      body: { text },
      params: { id },
   } = req;

   const video = await Video.findById(id);
   if (!video) {
      return res.sendStatus(404);
   }

   const commentOwner = await User.findById(user._id);

   const comment = await Comment.create({
      text,
      owner: user._id,
      video: id,
   });

   // video내 comments array에 새로 만들어진 comment의 id를 push해야 확인가능.
   commentOwner.comments.push(comment._id);
   video.comments.push(comment._id);
   commentOwner.save();
   video.save();

   /**
    * Status Code
    * 200: OK
    * 201: Created, The req has been fulfilled, resulting in the creation of a new resource.
    * 202: Accepted
    *    ...
    */
   return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
   const {
      session: { user },
      body: { videoId },
      params: { id },
   } = req;

   const comment = await Comment.findById(id);

   const video = await Video.findById(videoId);
   const commentOwner = await User.findById(user._id);

   console.log("video.comments", video);
   console.log("commentOwner.comments", commentOwner);

   if (String(commentOwner._id) === String(comment.owner)) {
      commentOwner.comments.splice(commentOwner.comments.indexOf(id), 1);
      video.comments.splice(video.comments.indexOf(id), 1);
      video.save();
      commentOwner.save();
      await Comment.findByIdAndDelete(id);
      return res.sendStatus(204);
   } else {
      req.flesh("Info", "Not authorized");
      return res.sendStatus(403);
   }
};
