import express from "express";
import multer from "multer";
import User from "../models/User.js";
import fs from "fs";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req,file,cb) =>{
    cb(null,"images");
  },
  filename:(req,file,cb)=>{
    cb(null,Date.now()+file.originalname);
  }
});

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
});

router.post("/upload",upload.single("image"),async(req,res)=>{
    try{
        if(!req.file){
            return res.status(200).json(
                {
                    message:"No file uploaded"
                }
            )

        }
        const fileData = fs.readFileSync(req.file.path);        
        const newUser = new User({
            name : req.body.name,
            email : req.body.email,
            password : req.body.password,
            image : {
                data : fileData,
                ContentType : req.file.mimetype,
                path : req.file.path,
                filename:req.file.filename
            }
        });
        await newUser.save();
        //fs.unlinkSync(req.file.path);
        res.status(201).json({
            message:"User uploaded successfully",
            userid : newUser._id,
        });        
    }catch(err){
        console.log(err);
    }
});
export default router;
