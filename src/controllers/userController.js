import User from "../models/User";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });

export const postJoin = async (req, res) => {
   const pageTitle = "Join";
   const { username, email, password, password2, name, location } = req.body;
   const exists = await User.exists({ $or: [{ username }, { email }] });

   if (password !== password2) {
      return res.status(400).render("join", {
         pageTitle,
         errorMessage: "Password confirmation does not match.",
      });
   }

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
   const user = await User.findOne({ username });

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
export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const logout = (req, res) => res.send("Logout");
export const see = (req, res) => res.send("See");
