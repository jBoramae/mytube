import multer from "multer";

export const localsMiddleware = (req, res, next) => {
   /*
   if(req.session.loggedIn) {
      res.locals.loggedIn = true;
   }
   */
   res.locals.loggedIn = Boolean(req.session.loggedIn);
   res.locals.siteName = "Mytube";
   res.locals.loggedInUser = req.session.user || {};
   // req.session.user || {} => or와 빈 오브젝트를 통해 undefined일때의 에러 해결

   // console.log(req.session.user);
   // console.log(res.locals);
   next();
};

export const protectorMiddleware = (req, res, next) => {
   // 사용자가 로그인되어있지 않은 걸 확인하면, 로그인 페이지로 redirect 시킴.
   if (req.session.loggedIn) {
      return next();
   } else {
      req.flash("error", "Log-in first.");
      return res.redirect("/login");
   }
};

export const publicOnlyMiddleware = (req, res, next) => {
   if (!req.session.loggedIn) {
      return next();
   } else {
      req.flash("error", "Not authorized.");
      // req.flash(타입, 메시지)
      return res.redirect("/");
   }
};

export const avatarUpload = multer({
   dest: "uploads/avatars/",
   limits: {
      fileSize: 5000000,
   },
});
export const videoUpload = multer({
   dest: "uploads/videos/",
   limits: {
      fileSize: 10000000,
   },
});
