import express from "express";
import { addProfilepPic, getUser, getUsers, updateUser } from "../controllers.js/userController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import upload from "../config/multer.js";
const router = express.Router();

/* READ */
router.get("/", verifyToken, getUsers);
router.get("/:id", verifyToken, getUser); 

/*UPDATE USER */
router.post('/add-profilepic', upload.single("file"), addProfilepPic)
router.put("/:id", verifyToken, updateUser);



export default router;
