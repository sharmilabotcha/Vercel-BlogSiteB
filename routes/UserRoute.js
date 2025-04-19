import express from "express";
import multer from "multer";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Blog from "../models/Blog.js";
import authMiddleware from "../middleware/authMiddleware.js";

dotenv.config();
const router = express.Router();

// Use memory storage for Multer (no disk writes)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("invalid file type"));
    }
  }
});

// Signup route (with image stored in MongoDB)
router.post("/upload", upload.single("profileImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Profile image is required"
      });
    }

    // Check if username or email already exists
    const nameexists = await User.findOne({ username: req.body.username });
    if (nameexists) {
      return res.status(409).json({
        message: "Name already exists"
      });
    }

    const emailexists = await User.findOne({ email: req.body.email });
    if (emailexists) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      profileImage: {
        data: req.file.buffer,
        ContentType: req.file.mimetype,
        filename: req.file.originalname
      }
    });

    await newUser.save();
    await sendEmail(newUser.email, newUser.username);

    res.status(201).json({
      message: "User uploaded successfully",
      userid: newUser._id
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Signup failed",
      error: err.message
    });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.password !== req.body.password) {
      return res.status(401).json({
        message: "Incorrect password"
      });
    }
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h'
      }
    );
    res.status(200).json({
      message: "Login successful",
      token: token,
      userId: user._id
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error logging in",
      error: error.message
    });
  }
});

// Profile route
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "user not found"
      });
    }

    // Fetch user's blogs
    const blogs = await Blog.find({ user: req.user.userId });

    // Prepare profile response
    const profileResponse = {
      name: user.username,
      email: user.email,
      avatar: user.profileImage && user.profileImage.data
        ? `data:${user.profileImage.ContentType};base64,${user.profileImage.data.toString('base64')}`
        : null,
      blogs: blogs.map(blog => ({
        id: blog._id,
        title: blog.title,
        category: blog.category,
        createdAt: blog.createdAt
      }))
    };

    res.status(200).json(profileResponse);
  }
  catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message
    });
  }
});

export default router;
