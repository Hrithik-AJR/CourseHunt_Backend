import  express  from "express";
import { addToPlaylist, changePassword, deleteMyProfile, deleteUser, forgetPassword, getAllUsers, getMyProfile, login, logout, removeFromPlaylist, resetPassword, signup, updateProfile, updateProfilePicture, updateUserRole } from "../controllers/usercontroller.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router=express.Router();
router.route("/signup").post(singleUpload,signup);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/me").post(isAuthenticated,getMyProfile);
router.route("/me").delete(isAuthenticated,deleteMyProfile);
router.route("/changepassword").put(isAuthenticated,changePassword);
router.route("/updateprofile").put(isAuthenticated,updateProfile);
router.route("/updateprofilepicture").put(isAuthenticated,singleUpload,updateProfilePicture);
router.route("/forgetpassword").post(forgetPassword);
router.route("/resetpassword/:token").put(resetPassword);
router.route("/addtoplaylist").post(isAuthenticated, addToPlaylist);
router.route("/removefromplaylist").delete(isAuthenticated, removeFromPlaylist);
router.route("/admin/users").get(isAuthenticated,authorizeAdmin,getAllUsers);
router.route("/admin/user/:id").put(isAuthenticated,authorizeAdmin,updateUserRole).delete(isAuthenticated,authorizeAdmin,deleteUser);
export default router;
