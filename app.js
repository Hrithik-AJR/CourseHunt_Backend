import express from "express";
import {config} from "dotenv"
import cookieParser from "cookie-parser";

config({
    path:"./config.env"
})
const app=express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
import course from "./routes/courseroutes.js"
import user from "./routes/userroutes.js"
import payment from "./routes/paymentroutes.js"
import other from "./routes/otherroutes.js"
import ErrorMiddleware from "./middlewares/error.js";

app.use("/api/v1",course);
app.use("/api/v1",user);
app.use("/api/v1",payment);
app.use("/api/v1",other);
export default app;
app.use(ErrorMiddleware);