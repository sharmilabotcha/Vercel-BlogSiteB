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
        data: Buffer,
        ContentType: String,
        path : String,
        filename : String
    },
    author:{
        type : String,
        required : true
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required : true
    }

},
{
    timestamps : true,
}
);

export default mongoose.model("Blog", blogschema);