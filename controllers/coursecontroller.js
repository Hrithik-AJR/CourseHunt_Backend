import { catchAsyncerror } from "../middlewares/catchAsyncerror.js";
import {Course}  from "../models/course.js";
import { Stats } from "../models/stats.js";
import getDataUri from "../utils/datauri.js";
import ErrorHandler from "../utils/errorhandler.js"
import cloudinary from "cloudinary";

export const getAllCourses=catchAsyncerror(async(req,res,next)=>{
    const keyword = req.query.keyword || "";
    const category = req.query.category || "";
  
    const courses = await Course.find({
      title: {
        $regex: keyword,
        $options: "i",
      },
      category: {
        $regex: category,
        $options: "i",
      },
    }).select("-lectures");
    return res.status(200).json({
         success:true,
         courses,
    });
});

export const createCourse=catchAsyncerror(async(req,res,next)=>{
    const { title, description, category, createdBy } = req.body;
    if (!title || !description || !category || !createdBy)
      return next(new ErrorHandler("Please Add all Fields", 400));

    const file = req.file;
    const fileUri = getDataUri(file);
    const mycloudd = await cloudinary.v2.uploader.upload(fileUri.content);
    await Course.create({
    title,
    description,
    category,
    createdBy,
    poster: {
      public_id: mycloudd.public_id,
      url: mycloudd.secure_url,
    },
  });
    return res.status(201).json({
         "success":true,
         "message": "Course Added Sucessfully . You can add lectures Now",
    });
});

export const getCourseLectures = catchAsyncerror(async (req, res, next) => {
    const course = await Course.findById(req.params.id);
    if (!course) return next(new ErrorHandler("Course NoT Found ", 404));
    course.views += 1;
    await course.save();
    res.status(200).json({
      success: true,
      lectures: course.lectures,
    });
  });

  export const addLecture = catchAsyncerror(async (req, res, next) => {
    const { id } = req.params;
    const { title, description } = req.body;
  
    const course = await Course.findById(id);
    if (!course) return next(new ErrorHandler("Course NoT Found ", 404));
    const file = req.file;
    const fileUri = getDataUri(file);
    const mycloudd = await cloudinary.v2.uploader.upload(fileUri.content, {
      resource_type: "video",
    });
    course.lectures.push({
      title,
      description,
      video: {
        public_id: mycloudd.public_id,
        url: mycloudd.secure_url,
      },
    });
    course.numberOfVideos = course.lectures.length;
    await course.save();
    res.status(200).json({
      success: true,
      message: "Lectures added Succesfully",
    });
  });

  export const deleteCourse = catchAsyncerror(async (req, res, next) => {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return next(new ErrorHandler("Course NoT Found ", 404));
    await cloudinary.v2.uploader.destroy(course.poster.public_id);
    for (let i = 0; i < course.lectures.length; i++) {
      const singleLecture = course.lectures[i];
      await cloudinary.v2.uploader.destroy(singleLecture.video.public_id, {
        resource_type: "video",
      });
      console.log(singleLecture.video.public_id);
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: "Course Deleted Successfully",
    });
  });

  export const deleteLecture = catchAsyncerror(async (req, res, next) => {
    const { courseId, lectureId } = req.query;
    const course = await Course.findById(courseId);
    if (!course) return next("hello");
    const lecture = course.lectures.find((item) => {
      if (item._id.toString() === lectureId.toString()) return item;
    });
    await cloudinary.v2.uploader.destroy(lecture.video.public_id, {
      resource_type: "video",
    });
    course.lectures = course.lectures.filter((item) => {
      if (item._id.toString() !== lectureId.toString()) return item;
    });
    course.numberOfVideos = course.lectures.length;
    await course.save();
    res.status(200).json({
      success: true,
      message: "Lectures Deleted Successfully",
    });
  });

  Course.watch().on("change", async () => {
    const stats = await Stats.find({}).sort({ createAt: "desc" }).limit(1);
    const courses = await Course.find({});
    let totalViews = 0;
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      totalViews += course.views;
    }
    stats[0].views = totalViews;
    stats[0].createdAt = new Date(Date.now());
  
    await stats[0].save();
  });