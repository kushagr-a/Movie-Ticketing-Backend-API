import { Request,Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import {createError} from "../utils/createError.utils"

// 👇 Extended Request interface to include 'user'
interface CustomRequest extends Request {
    user?: any;
  }

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) : Promise<void> =>{
    const token = req.cookies?.token;

    if(!token){
        throw createError(401, "Access Denied. Token missing. Required to login")
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        (req as CustomRequest).user = decoded;
        next();
    } catch (error) {
        throw createError(403, "Invalid token")
    }
}