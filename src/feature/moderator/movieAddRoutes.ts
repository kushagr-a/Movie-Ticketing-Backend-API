import { Router } from "express";
import { verifyToken } from "../auth/tokenVerify"
import {
    addMovie,
    getAllMoviesByModerator,
    getAllMoviesAddedByModerator,
    updateMovieById,
    deleteMovieById,
    getAllUser,
    getAllModerator,
    getParticularUser,
    getparticularUserFeedBack

} from "../moderator/movieAddController";
import { upload } from "../../utils/multer/multer"
import { authorizeRole } from "../../feature/RBAC/roleAuthorize"
import { Role } from "../../feature/RBAC/Role"

const movieAddRouter = Router();

movieAddRouter.route("/addMovie").post(verifyToken,
    authorizeRole(Role.MODERATOR),
    upload.single("poster"),
    addMovie
)

movieAddRouter.route("/getAllMovies").get(
    verifyToken,
    authorizeRole(Role.MODERATOR, Role.ADMIN),
    getAllMoviesByModerator
)

movieAddRouter.route("/getMovieOnlyAddByModerator").get(
    verifyToken,
    authorizeRole(Role.MODERATOR, Role.ADMIN),
    getAllMoviesAddedByModerator
)

movieAddRouter.route("/updateMovieById/:id").patch(
    verifyToken,
    authorizeRole(Role.MODERATOR),
    upload.single("poster"),
    updateMovieById
)

movieAddRouter.route("/deleteMovieById/:id").delete(
    verifyToken,
    authorizeRole(Role.MODERATOR),
    deleteMovieById
)

movieAddRouter.route("/getAllUsers").get(
    verifyToken,
    authorizeRole(Role.MODERATOR, Role.ADMIN),
    getAllUser
)

movieAddRouter.route("/getAllModerator").get(
    verifyToken,
    authorizeRole(Role.MODERATOR, Role.ADMIN),
    getAllModerator
)

movieAddRouter.route("/getParticularUser/:id").get(
    verifyToken,
    authorizeRole(Role.MODERATOR, Role.ADMIN),
    getParticularUser
)

movieAddRouter.route("/getUserFeedback").get(
    verifyToken,
    authorizeRole(Role.MODERATOR, Role.ADMIN),
    getparticularUserFeedBack
)


export default movieAddRouter
