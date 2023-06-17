import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorhandler.js";
import { User } from "../models/user.js";
import { catchAsyncerror } from "./catchAsyncerror.js";

export const isAuthenticated = catchAsyncerror(async (req, res, next) => {
  const { token } = req.cookies;
  // console.log(token);
  if (!token) return next(new ErrorHandler("Login First", 401));
  const decodedata = jwt.verify(token, process.env.JWT_SECRET);
  // console.log(decodedata);
  req.user = await User.findById(decodedata._id);
  next();
});

export const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== "admin")
      return next(new ErrorHandler(`${req.user.role} is not allowed to access this resource`,403));
      next();
  };

  export const authorizeSubscribers = (req, res, next) => {
    if (req.user.subscription.status !== "active" && req.user.role !== "admin")
      return next(
        new ErrorHandler(`Only Subscriber can access this resource`, 403)
      );
    next();
  };