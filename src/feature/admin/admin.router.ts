import { Router } from "express";
import { authorizeRole } from "../RBAC/roleAuthorize";
import { Role } from "../RBAC/Role";
import { verifyToken } from "../auth/tokenVerify";
import { getMovieByModerator, gettingAllUserProfile } from "./admin.controller";
import {
    addMovie,
    getAllMovies,
    getMovieByAdmin,
    updateMovieById,
    deleteMovieById,
    getparticularUserFeedBack,
    deleteUserBythereUserId,
    getAllModerator,
    deleteModerator

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
adminRouter.route("/getMovieByModerator").get(
    verifyToken,
    authorizeRole(Role.ADMIN),
    getMovieByModerator
);
adminRouter.route("/deleteModerator").delete(
    verifyToken,
    authorizeRole(Role.ADMIN),
    deleteModerator
);
adminRouter.route("/getAllModerator").get(
    verifyToken,
    authorizeRole(Role.ADMIN),
    getAllModerator
);

// user router
adminRouter.route("/getAllUsersProfile").get(
    verifyToken,
    authorizeRole(Role.ADMIN),
    gettingAllUserProfile
);
adminRouter.route("/getParticularUserFeedBack").get(
    verifyToken,
    authorizeRole(Role.ADMIN),
    getparticularUserFeedBack
);
adminRouter.route("/deleteUserById/:userId").delete(
    verifyToken,
    authorizeRole(Role.ADMIN),
    deleteUserBythereUserId
);

export default adminRouter;