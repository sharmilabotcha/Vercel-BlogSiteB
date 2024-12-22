import mongoose from "mongoose";
const Schema = mongoose.Schema;

const blogschema = new Schema({
    title : {
        type: String,
        required: true,
    },
    category : {
        type : String,
        required: true,
    },
    description :{
        type : String,
        required : true,
    },
    blogimage:{
        Data: Buffer,
        ContentTyoe: String,
        path : String,
        filename : String
    },
    author:{
        type : String,
        required : true
    }

});

export default mongoose.model("Blog", blogschema);