let videos = [
   {
      title: "First Video",
      rating: 5,
      comments: 2,
      createdAt: "2 minutes ago",
      views: 59,
      id: 1,
   },
   {
      title: "Second Video",
      rating: 5,
      comments: 2,
      createdAt: "2 minutes ago",
      views: 59,
      id: 2,
   },
   {
      title: "Third Video",
      rating: 5,
      comments: 2,
      createdAt: "2 minutes ago",
      views: 59,
      id: 3,
   },
];

export const recommended = (req, res) => {
   return res.render("home", { pageTitle: "Home", videos });
};
// res.render("home"); >> 에러가 생기는 이유: 디렉토리가 잘못됨.
// mytube의 package.json에서 node.js를 실행하고 있기 때문에, 디렉토리가 /src가 아닌 /mytube가 됨.

export const watch = (req, res) => {
   const { id } = req.params;
   const video = videos[id - 1];
   return res.render("watch", { pageTitle: `Watching: ${video.title}`, video });
};
// const { id } = req.params === const id = req.params.id;

export const getEdit = (req, res) => {
   const { id } = req.params;
   const video = videos[id - 1];
   res.render("edit", { pageTitle: `Editing: ${video.title}`, video });
};
export const postEdit = (req, res) => {
   const { id } = req.params;
   const { title } = req.body;
   videos[id - 1].title = title;
   return res.redirect(`/videos/${id}`);
};
// 유저가 getEdit으로 이동, form을 render, 유저가 submit시 post.req로 이동,
// postEdit이 처리, postEdit은 route로부터 id를 얻어서, `/videos/${id}`로 redirect
