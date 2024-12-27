import express from "express";
import multer from "multer";
import Blog from "../models/Blog.js";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req,file,cb) =>{
        const uploadsDir = path.join(process.cwd(), "uploads");
        if(!fs.existsSync(uploadsDir)){
            fs.mkdirSync(uploadsDir);
        }
        cb(null,uploadsDir);
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+file.originalname);
    }

})

const upload = multer({
    storage:storage,
    limits:{filesize:5*1024*1024},
    fileFilter:(req,file,cb)=>{
        const allowedtypes = ["image/jpeg","image/jpg","image/png"];
        if(allowedtypes.includes(file.mimetype)){
            cb(null,true);
        }else{
            cb(new Error("invalid file type"));
        }
    }
})

router.post("/upload",authMiddleware,upload.single("blogimage"),async(req,res)=>{
    try{

        console.log('recieved body', req.body);
        console.log('recieved file', req.file);
        if(!req.file){
            return res.status(200).json(
                {
                    message:"No file uploaded"
                }
            )

        }
        const fileData = fs.readFileSync(req.file.path);
        const newBlog = new Blog({
            title : req.body.title,
            category : req.body.category,
            description : req.body.description,
            blogimage:{
                data : fileData,
                ContentType : req.file.mimetype,
                path : req.file.path,
                filename:req.file.filename
            },
            author :req.body.author,
            user: req.user.id
        });
        await newBlog.save();
        //fs.unlinkSync(req.file.path);
        res.status(201).json({
            message:"Blog Post uploaded successfully",
            blogid : newBlog._id,
            imagepath : req.file.path,
            filename : req.file.filename
        });
    }
    catch(err){
        res.status(500).json({
            message:"Error creating blog post",
            error: err.message
        });
    }
});

router.get("/",authMiddleware, async (req,res)=>{
    try{
        const blogs = await Blog.find();

        //transform blogs to include image as base64
        const transformedBlogs = blogs.map(blog=>({
            ...blog.toObject(),
            blogimage: blog.blogimage && blog.blogimage.data
                ? {
                    data:`data:${blog.blogimage.ContentType};base64,${blog.blogimage.data.toString('base64')}`,
                    contentType: blog.blogimage.ContentType,
                    filename: blog.blogimage.filename
                }
                : null
        }));

        res.status(200).json(transformedBlogs);

    }catch(err){
        res.status(500).json({
            message:"Error fetching blog posts",
            error: err.message
        });
    }
});

router.get("/my-blogs",authMiddleware, async (req,res)=>{
    try{
        const userBlogs = await Blog.find({user:req.user.id});
        
        //transform blogs to include image as base64
        const transformedBlogs = userBlogs.map(blog=>({
            ...blog.toObject(),
            blogimage: blog.blogimage && blog.blogimage.data
                ? {
                    data:`data:${blog.blogimage.ContentType};base64,${blog.blogimage.data.toString('base64')}`,
                    contentType: blog.blogimage.ContentType,
                    filename: blog.blogimage.filename
                }
                : null
        }));

        res.status(200).json(transformedBlogs);

    }catch(err){
        res.status(500).json({
            message:"Error fetching blog posts",
            error: err.message
        });
    }
})

router.delete("/:id", authMiddleware, async (req,res)=>{
    try{
        const blog = await Blog.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if(!blog){
            return res.sendStatus(404).json({
                message:"Blog not found "
            });
        }

        if(blog.blogimage.path && blog.blogimage){
            try{
                fs.unlinkSync(blog.blogimage.path);
            }
            catch(err){
                console.log(err);
            }
        }

        res.status(200).json({
            message:"Blog deleted successfully"
        });
    }
    catch(err){
        res.status(500).json({
            message:"Error deleting blog",
            error: err.message
        });
    }
})

//get all blogs
router.get("/allblogs", async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate({
                path: 'user',
                select: 'username profileImage ',
                options: { 
                    strictPopulate: false 
                }
            })
            .sort({ createdAt: -1 });

        // Safe base64 conversion function
        const safeBase64 = (contentType, data) => {
            try {
                if (!contentType || !data) return null;
                return `data:${contentType};base64,${Buffer.from(data).toString('base64')}`;
            } catch (error) {
                console.error('Base64 conversion error:', {
                    contentType,
                    dataType: typeof data,
                    error: error.message
                });
                return null;
            }
        };

        // Transform blogs with comprehensive null checking
        const transformedBlogs = blogs.map(blog => {
            // Safely handle user and image data
            const user = blog.user || {};
            const userProfileImage = user.profileImage || {};
            const blogImage = blog.blogimage || {};

            return {
                id: blog._id,
                title: blog.title || 'Untitled',
                category: blog.category || 'Uncategorized',
                description: blog.description || 'No description',
                author: blog.author || (user.username || 'Anonymous'),
                avatar: safeBase64(userProfileImage.ContentType, userProfileImage.data),
                image: safeBase64(blogImage.ContentType, blogImage.data),
                date: blog.createdAt || new Date(),
                views: 0,
                likes: 0,
                comments: 0,
            };
        }).filter(blog => blog.title); // Remove any blogs without a title

        res.status(200).json(transformedBlogs);
    } catch (error) {
        console.error("Detailed error fetching blog posts:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({
            message: "Error fetching blog posts",
            error: error.message,
            details: error.stack
        });
    }
});



export default router;