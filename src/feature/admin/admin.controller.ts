import { Request, Response } from "express";
import { UserModel } from "../auth/users.model"


export const gettingAllUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const allUsers = await UserModel.find();
        res.status(200).json({
            success: true,
            message: "All users fetched successfully",
            data: allUsers,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Error fetching users",
        });
    }
}