import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/createError.utils";

// 👇 Extended Request interface to include 'user'
interface CustomRequest extends Request {
  user?: any;
}

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
    if((req as CustomRequest).user?.admin == 'admin'){
        throw createError(403, "Access denied. Admins only.")
    }
    
    next()
};
