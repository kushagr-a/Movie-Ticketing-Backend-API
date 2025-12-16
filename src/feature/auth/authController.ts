import { Request, Response } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { UserModel } from "./users.model";
import { Role } from "./authTypes";

// Controller for Register User
export const register = async (req: Request, res: Response) => {
    try {
        const { fullName, email, password, role } = req.body;

        //  Basic validation
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "fullName, email and password are required",
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check existing user
        const existingUser = await UserModel.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        // Hash password
        const hashedPassword = await argon2.hash(password);

        // Role handling (DEFAULT USER)
        let userRole: Role = Role.USER;

        if (role) {
            if (!Object.values(Role).includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid role",
                });
            }
            userRole = role;
        }

        // Create user
        const newUser = await UserModel.create({
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: userRole,
        });

        // Generate JWT
        const token = jwt.sign(
            {
                id: newUser._id.toString(),
                role: newUser.role,
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "7h",
            }
        );

        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Response
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                // _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role,
            },
            accessToken: token,
        });
    } catch (error: any) {
        console.error("Register Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Controller for Login User
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json(
                {
                    success: false,
                    message: "Email and password are required",
                }
            )
        }

        const user = await UserModel.findOne({ email })

        if (!user) {
            return res.status(404).json(
                {
                    success: false,
                    message: "User not found",
                }
            )
        }

        const isPasswordValid = await argon2.verify(user.password, password)

        if (!isPasswordValid) {
            return res.status(401).json(
                {
                    success: false,
                    message: "Invalid password",
                }
            )
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user._id.toString(),
                role: user.role,
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "7h",
            }
        );

        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        // Response
        return res.status(200).json(
            {
                success: true,
                message: "User logged in successfully",
                user: {
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                },
                accessToken: token,
            }
        )
    } catch (error: any) {
        console.error("Login Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// Controller for Logout User
export const logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie("token");
        return res.status(200).json(
            {
                success: true,
                message: "User logged out successfully",
            }
        )
    } catch (error: any) {
        console.error("Logout Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}