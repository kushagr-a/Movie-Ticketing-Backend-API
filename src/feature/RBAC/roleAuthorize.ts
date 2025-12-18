import { Request, Response, NextFunction } from "express";
import { Role } from "./Role";

export const authorizeRole = (...allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Check if user is authenticated (should come from verifyToken middleware)
            if (!req.user) {
                return res.status(401).json(
                    {
                        success: false,
                        message: "Unauthorized"
                    }
                )
            }
            // Get role from authenticated user (not from req.body - security issue!)
            const userRole = req.user.role as Role;

            // Check if user has permission to access the route
            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json(
                    {
                        success: false,
                        message: "Forbidden"
                    }
                )
            }
            // If user has permission, continue to the next middleware
            next();

        } catch (error) {
            console.error("Error in authorizeRole middleware:", error);
            return res.status(500).json(
                {
                    success: false,
                    message: "Internal Server Error"
                }
            )
        }
    }
}