import { NextFunction, Request, Response } from "express";
import jwt, {
    JsonWebTokenError,
    TokenExpiredError
} from "jsonwebtoken";
import { Role } from "../RBAC/Role";

export const verifyToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Read token (cookie OR header)
        const token = req.cookies.token ||
            req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token missing",
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }

        // verify token 
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as jwt.JwtPayload;

        // Attach user to request
        req.user = {
            id: decoded.id,
            role: decoded.role as Role,
        };

        next();
    } catch (error) {
        if (error instanceof JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        if (error instanceof TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: "Token expired",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Authentication failed",
        });
    }
}


// export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
//     const token = req.cookies.token;
//     if (!token) {
//         return res.status(401).json({
//             success: false,
//             message: "Unauthorized",
//         });
//     }
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
//         req.user = decoded;
//         next();
//     } catch (error) {
//         return res.status(401).json({
//             success: false,
//             message: "Unauthorized",
//         });
//     }
// };