import { Router } from "express";
import { authorizeRole } from "../RBAC/roleAuthorize";
import { Role } from "../RBAC/Role";
import { verifyToken } from "../auth/tokenVerify";
import { gettingAllUserProfile } from "./admin.controller";
import {
    addMovie,
    getAllMovies,
    getMovieByAdmin,
    updateMovieById,
    deleteMovieById,

} from "./admin.controller";
import { upload } from "../../utils/multer/multer";
const adminRouter = Router();

adminRouter.route("/addMovie").post(
    verifyToken,
    authorizeRole(Role.ADMIN),
    upload.single("poster"),
    addMovie
);
adminRouter.route("/getAllMovies").get(
    verifyToken,
    authorizeRole(Role.ADMIN),
    getAllMovies
);

// admin get movie those only added by admin
adminRouter.route("/getMovieByAdmin").get(
    verifyToken,
    authorizeRole(Role.ADMIN),
    getMovieByAdmin
);
adminRouter.route("/updateMovieById/:id").patch(
    verifyToken,
    authorizeRole(Role.ADMIN),
    upload.single("poster"),
    updateMovieById
);
adminRouter.route("/deleteMovieById/:id").delete(
    verifyToken,
    authorizeRole(Role.ADMIN),
    deleteMovieById
);

// moderator router
// admin get movie those only added by moderator
// adminRouter.route("/getMovieByModerator").get();
// adminRouter.route("/deleteModerator").delete();
// adminRouter.route("/getAllModerator").get();
// adminRouter.route("/updateModeratorRole").put();

// user router
adminRouter.route("/getAllUsersProfile").get(
    verifyToken,
    authorizeRole(Role.ADMIN),
    gettingAllUserProfile
);
// adminRouter.route("/getUserFeedBack").get();
// adminRouter.route("/deleteUserByName").delete();

export default adminRouter;