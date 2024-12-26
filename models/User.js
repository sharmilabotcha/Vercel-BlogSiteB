import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }, 
    profileImage :{
        data : Buffer,
        ContentType : String,
        path : String,
        filename : String
    }  
},  
{
    timestamps: true,
});

export default mongoose.model("User", userSchema);