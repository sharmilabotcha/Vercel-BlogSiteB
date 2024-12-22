import express from "express";

const router = express.Router();
router.get("/", (req, res) => {
    res.send("here is your data");
  });
  router.post("/", (req, res) => {
    res.send("created");
  });
  router.put("/", (req, res) => {
    res.send("updated");
  });
  router.delete("/", (req, res) => {
    res.send("data deleted");
  });
  export default router;