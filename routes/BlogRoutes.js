import express from "express";
import multer from "multer";
import Blog from "../models/Blog.js";
import fs from "fs";

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req,file,cb) =>{
        cb(null,"images");
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

router.post("/upload",upload.single("blogimage"),async(req,res)=>{
    try{
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
            author :req.body.author
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

export default router;