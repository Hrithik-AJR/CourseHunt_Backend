import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const schema=new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Your Name"],
      },
      email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        validate: validator.isEmail,
      },
      password: {
        type: String,
        required: [true, "Please Enter Your Password"],
        minLength: [6, "Password must be at least 6 characters"],
        select: false, //  isse jb user ko access krenge toh password nahi milega by default
      },
      role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
      },
      subscription: {
        id: String,
        status: String,  //used in razorpay
      }, 
      avatar: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
      playlist: [
        {
          course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
          },
          poster: String,
        },
      ],
      createAt: {
        type: Date,
        default: Date.now,
      },
      resetPasswordToken: String, // reset password token ko yha save karlenge
      resetPasswordExpire: String, // aur uska expiry time save krlenge
});

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

schema.methods.getJWToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "16d",
  });
};

schema.methods.comparePassword = async function (password) {
  // console.log(this.password);
  return await bcrypt.compare(password, this.password);
};
schema.methods.getResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex"); 
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

export const User=mongoose.model("User",schema);
