import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const authMiddleware = async (req,res,next)=>{
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).json({
            message:"No token provided. Authorization denied"
        })
    }
    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId);
        if(!user){
            return res.status(401).json({
                message:"User not found"
            })
        }
        req.user = {
            id:user._id,
            username:user.username,
            email:user.email
        };
        next();
    }catch(error){
        if(error.name === "TokenExpiredError"){
            return res.status(401).json({
                message:"Token expired. Please login again"
            })
        }
        return res.status(401).json({
            message:"Invalid token. Authorization denied"
        })
    }
}

export default authMiddleware;