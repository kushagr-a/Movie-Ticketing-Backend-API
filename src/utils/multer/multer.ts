import multer from "multer";
import { Request } from "express";
import {CloudinaryStorage }from "multer-storage-cloudinary";
import cloudinary from "../cloudinary/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    return {
      folder: "movie_poster",
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "jfif"],
      public_id: `movie-${Date.now()}`,
    };
  },
});

export const upload = multer({
  storage,
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
});
