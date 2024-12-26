import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// @param {string} to 
// @param {string} username

export const sendEmail = async (to,username)=>{
    try{
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: "Welcome to BlogSite",
            html:`
            <h1>Welcome , ${username}</h1>
            <p>Thank you for joining blogsite</p>
            <p>Create amazing blogs and share them with the world</p>
            <p>Best regards, <br> Your BlogSite Team</p>`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    }catch(error){
        console.error("Error sending email:", error);
    }
};