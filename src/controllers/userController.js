import Video from "../models/Video";
import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });

export const postJoin = async (req, res) => {
   const pageTitle = "Join";
   const { username, email, password, password2, name, location } = req.body;

   if (password !== password2) {
      return res.status(400).render("join", {
         pageTitle,
         errorMessage: "Password confirmation does not match.",
      });
   }

   const exists = await User.exists({ $or: [{ username }, { email }] });

   if (exists) {
      return res.status(400).render("join", {
         pageTitle,
         errorMessage: "This username/email is already taken.",
      });
   }

   /* 
      그냥 render할 경우, status code가 200으로 응답하여 브라우저에서 성공으로 인식함.
      이를 막기 위해, res.status(400).render 사용
   */

   try {
      await User.create({
         name,
         username,
         email,
         password,
         location,
      });
      return res.redirect("/login");
   } catch (error) {
      return res
         .status(404)
         .render("join", { pageTitle, errorMessage: error._message });
   }
};

export const getLogin = (req, res) => {
   res.render("login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
   const pageTitle = "Login";
   const { username, password } = req.body;
   const user = await User.findOne({ username, socialOnly: false });

   if (!user) {
      return res.status(400).render("login", {
         pageTitle,
         errorMessage: "An account with this username does not exists.",
      });
   }

   const ok = await bcrypt.compare(password, user.password);

   if (!ok) {
      return res.status(400).render("login", {
         pageTitle,
         errorMessage: "Wrong password.",
      });
   }

   req.session.loggedIn = true;
   // 세션의 로그인 상태 속성을 true로 만드는 부분? => 사용자가 로그인 하면 loggedIn 속성 => True
   req.session.user = user;
   // req.session의 user <= DB에서 찾은 user로 세션에 정보를 추가.
   // req.session.loggedIn과 req.session.user는 실제로 세션을 initialize하는 부분.

   return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
   const baseUrl = "https://github.com/login/oauth/authorize";
   const config = {
      client_id: process.env.GH_CLIENT,
      allow_signup: false,
      scope: "read:user user:email",
   };
   // github oauth 파라미터 그대로 써야 함!
   // scope => read:user 덕분에 user의 정보를 읽을 수 있는 access_token을 받을 수 있음.
   const params = new URLSearchParams(config).toString();
   const finalUrl = `${baseUrl}?${params}`;

   return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
   const baseUrl = "https://github.com/login/oauth/access_token";
   const config = {
      client_id: process.env.GH_CLIENT,
      client_secret: process.env.GH_SECRET,
      code: req.query.code,
   };

   const params = new URLSearchParams(config).toString();
   const finalUrl = `${baseUrl}?${params}`;
   const tokenRequest = await (
      await fetch(finalUrl, {
         method: "POST",
         headers: {
            Accept: "application/json",
         },
      })
   ).json();
   // finalUrl에 POST req를 보내고, fetch를 통해 데이터를 받고, 그 데이터에서 JSON 추출

   if ("access_token" in tokenRequest) {
      // access API
      const { access_token } = tokenRequest;
      // === tokenRequest.access_token
      const apiUrl = "https://api.github.com";

      const userData = await (
         await fetch(`${apiUrl}/user`, {
            headers: {
               Authorization: `token ${access_token}`,
            },
         })
      ).json();
      // user 데이터를 fetch json을 통해 access_token에 받아옴.
      console.log(userData);

      const emailData = await (
         await fetch(`${apiUrl}/user/emails`, {
            headers: {
               Authorization: `token ${access_token}`,
            },
         })
      ).json();
      // email 데이터를 fetch json을 통해 access_token에 받아옴.

      const emailObj = emailData.find(
         (email) => email.primary === true && email.verified === true
      );

      if (!emailObj) {
         // set notification
         return res.redirect("/login");
      }

      let user = await User.findOne({ email: emailObj.email });

      if (!user) {
         // create an account
         user = await User.create({
            avatarUrl: userData.avatar_url,
            name: userData.name,
            username: userData.login,
            email: emailObj.email,
            password: "",
            socialOnly: true,
            location: userData.location,
         });
      }

      // user를 찾았다면,
      req.session.loggedIn = true;
      req.session.user = user;
      return res.redirect("/");
   } else {
      // res(json) 안에 !access_token === redirect login
      return res.redirect("/login");
   }
};

export const logout = (req, res) => {
   req.session.loggedIn = false;
   // req.session.destroy();
   req.flash("info", "Bye Bye!");
   return res.redirect("/");
};

export const getEdit = (req, res) => {
   return res.render("edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
   const {
      body: { name, email, username, location },
      session: {
         user: { _id, avatarUrl },
      },
      file,
   } = req;
   // === const id = req.session.user.id;
   console.log(file);

   // username & email 유효성 검사
   const user = await User.findById(_id);
   let searchParams = [];
   // console.log("user email:", user.email);
   // console.log("email:", email);

   // 현재 유저 이메일 !== 입력한 폼의 이메일 => push.(이메일 오브젝트)
   if (user.email !== email) {
      searchParams.push({ email });
   }
   // 현재 유저 유저네임 !== 입력한 폼의 유저네임 => push.(유저네임 오브젝트)
   if (user.username !== username) {
      searchParams.push({ username });
   }

   // 서치 파라미터 !== null
   if (searchParams.length > 0) {
      const findUser = await User.findOne({ $or: searchParams });

      // 입력한 폼의 데이터로 검색된 유저가 있으며 && 검색된 유저의 id와 현재 세션의 id가 일치하지 않음
      if (findUser && findUser._id.toString() !== _id) {
         return res.status(400).render("edit-profile", {
            pageTitle: "Edit Profile",
            errorMessage: "This username/email is already taken.",
         });
      }
   }

   const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
         avatarUrl: file ? file.path : avatarUrl,
         name,
         email,
         username,
         location,
      },
      { new: true }
   );
   // new: true => 기존의 object return이 아닌, 새로 업데이트된 object return하는 option.

   req.session.user = updatedUser;

   /*
   req.session.user = {
      ...req.session.user,
      name,
      email,
      username,
      location,
   };
   */
   // cf) ...req.session.user => user object의 모든 내용

   return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
   if (req.session.user.socialOnly === true) {
      req.flash("error", "Can't change password.");
      return res.redirect("/");
      // form을 보여주지만, 사용할 수 없게 할 수도 있음 => 비밀번호가 있어야만 변경가능케
   }
   return res.render("users/change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
   // Send notification
   const {
      session: {
         user: { _id },
      },
      body: { oldPassword, newPassword, newPasswordConfirmation },
   } = req;

   const user = await User.findById(_id);
   const ok = await bcrypt.compare(oldPassword, user.password);

   if (!ok) {
      return res.status(400).render("users/change-password", {
         pageTitle: "Change Password",
         errorMessage: "The current password is incorrect.",
      });
   }

   if (newPassword !== newPasswordConfirmation) {
      return res.status(400).render("users/change-password", {
         pageTitle: "Change Password",
         errorMessage: "The new password does not match the confirmation.",
      });
   }

   user.password = newPassword;
   await user.save();
   req.flash("info", "Password updated!");
   // DB에 저장하는 데 시간이 걸림 => user.save();는 promise? => await
   // user.save(); => userSchema.pre("save", ) Middleware가 작동함.

   return res.redirect("/users/logout");
};

export const see = async (req, res) => {
   const { id } = req.params;
   const user = await User.findById(id).populate({
      path: "videos",
      populate: {
         path: "owner",
         model: "User",
      },
   });
   // Double populate: 내가 유저를 DB에서 받고,
   // 그리고 그 유저가 업로드한 비디오를 받음.
   // 그리고 mixin 형태대문에 그 비디오의 creator를 받음.

   if (!user) {
      return res.status(404).render("404", { pageTitle: "User is not found." });
   }

   return res.render("users/profile", {
      pageTitle: `${user.name}의 Profile`,
      user,
   });
};
