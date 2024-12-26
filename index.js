import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoute from "./routes/UserRoute.js";
import blogRoute from "./routes/BlogRoutes.js";
import cors from "cors";

 const app = express();
 dotenv.config();
 const PORT = process.env.PORT || 4000;
 app.use(express.json());
 mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use(cors());
app.use("/api/users", userRoute);
app.use("/api/blogs", blogRoute);

app.listen(PORT, () => {
  console.log(`port is running on ${PORT}`);
}); 