import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary"
import cloudinary from "../cloudinary/cloudinary"

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        return {
            folder: "movie_poster",
            resource_type: "image",
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            public_id: `movie-${Date.now()}`, // unique name
        }
    }
})

export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
    }
})