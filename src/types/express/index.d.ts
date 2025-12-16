declare namespace Express {
    export interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
  import { UserDocument } from "../models/user.model"; // adjust path

declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
      user?: UserDocument; // agar JWT auth laga hai
    }
  }
}

export {};
