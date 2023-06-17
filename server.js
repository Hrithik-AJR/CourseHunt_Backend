import app from "./app.js";
import { connectDB } from "./config/database.js";
import cloudinary from "cloudinary";
import Razorpay from "razorpay"
import nodeCron from "node-cron";
import { Stats } from "./models/stats.js";
import cors from "cors"
connectDB();

const corsOptions ={
   origin:'*', 
   credentials:true,
   optionSuccessStatus:200,
}

app.use(cors(corsOptions)) 

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API,
    api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
  });

  export const instance=new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
  });

  nodeCron.schedule("0 0 0 1 * *", async () => {
    try {
      await Stats.create({});
    } catch (error) {
      console.log(error);
    }
  });


app.listen(process.env.PORT,()=>{
console.log(`Server is working on port: ${process.env.PORT}`)
});