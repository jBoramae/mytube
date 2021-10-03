import Mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Mongoose.Schema({
   email: { type: String, required: true, unique: true },
   avatarUrl: { type: String },
   socialOnly: { type: Boolean, default: false },
   username: { type: String, required: true, unique: true },
   password: { type: String },
   name: { type: String, required: true },
   location: String,
   comments: [{ type: Mongoose.Schema.Types.ObjectId, ref: "Comment" }],
   videos: [{ type: Mongoose.Schema.Types.ObjectId, ref: "Video" }],
});

userSchema.pre("save", async function () {
   if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 5);
   }
});

const User = Mongoose.model("User", userSchema);

export default User;
