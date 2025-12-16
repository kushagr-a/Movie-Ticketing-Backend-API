import { Router } from "express";
import { verifyToken } from "../auth/tokenVerify"
import { addMovie } from "../moderator/movieAddController";
import { upload } from "../../utils/multer/multer"

const movieAddRouter = Router();

movieAddRouter.route("/addMovie").post(verifyToken,
    upload.single("poster"),
    addMovie
)

export default movieAddRouter
