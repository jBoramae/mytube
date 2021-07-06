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

   console.log("LOG USER IN! COMING SOON!");
   return res.redirect("/");
};
export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const logout = (req, res) => res.send("Logout");
export const see = (req, res) => res.send("See");