import "express";
import { Role } from "../feature/RBAC/Role";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      };
      file?: Express.Multer.File;
    }
  }
}

export {};
