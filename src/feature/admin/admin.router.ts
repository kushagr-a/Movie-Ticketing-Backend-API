import { Router } from "express";

const adminRouter = Router();

adminRouter.route("/addMovie").post();
adminRouter.route("/getAllMovies").get();

// admin get movie those only added by admin
adminRouter.route("/getMovieByAdmin").get();
adminRouter.route("/updateMovieById").put();
adminRouter.route("/deleteMovieById").delete();

// moderator router
// admin get movie those only added by moderator
adminRouter.route("/getMovieByModerator").get();
adminRouter.route("/deleteModerator").delete();
adminRouter.route("/getAllModerator").get();
adminRouter.route("/updateModeratorRole").put();

// user router
adminRouter.route("/getAllUsers").get();
adminRouter.route("/getUserFeedBack").get();
adminRouter.route("/deleteUserByName").delete();

export default adminRouter;