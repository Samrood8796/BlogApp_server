import express from "express";
import { forgotPassword, googleLogin, login, register, resetPassword, updateProPic } from "../controllers.js/authController.js";


const router = express.Router();

router.post("/register", register)
router.post("/login", login);
router.get("/google-login", googleLogin);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);
router.put("/update", updateProPic)



export default router;
