import bcrypt from "bcrypt";
import Jwt from 'jsonwebtoken';
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import crypto from "crypto";
import ResetToken from "../models/ResetToken.js";
import dotenv from "dotenv";
const jwt_secret_key = process.env.JWT_SECRET
import transport from "../config/nodemailer.js";
dotenv.config();

// Register
export const register = async (req, res) => {
    try {
        const { userName, email, password, phoneNumber } = req.body;

        // input validation rules
        await Promise.all([
            body("userName")
                .matches(/^[a-z0-9A-Z]+$/)
                .withMessage(
                    "UserName must contain only lowercase letters, uppercase, and numbers "
                )
                .run(req),
            body("email").isEmail().withMessage("Invalid email address").run(req),
            body("password")
                .isLength({ min: 4 })
                .withMessage("Password must be at least 4 characters long")
                .run(req),
            body("phoneNumber")
                .isLength({ max: 10, min: 10 })
                .withMessage("Phone number not valid")
                .run(req),
        ]);

        const errors = validationResult(req);
        // console.log(errors);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map((error) => error.msg);
            return res.status(400).json({ error: errorMessages });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: ["User Already Exists!"] });
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            userName,
            name: "",
            email,
            phoneNumber,
            password: passwordHash,
        });

        // Save user to database
        const savedUser = await newUser.save();

        // Return success message with user data
        return res.status(200).json({
            status: "Pending",
            message: "User registration successful",
            user: savedUser._id,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};


// login
export const login = async (req, res) => {
    try {
        const {userNameOrEmail, password } = req.body;
        const user = await User.findOne({
            $or: [{ email: userNameOrEmail }, { userName: userNameOrEmail }]
        });
        if (!user) return res.status(400).json({ msg: "User does not exist. " });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid Password. " });

        const accessToken = Jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        delete user.password;
        res.status(200).json({ accessToken, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// update profile pic
export const updateProPic = async (req, res) => { 
    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "ProfileImage",
        });
        const picturePath = result.secure_url;
        const { id } = req.user;
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { picturePath },
            { new: true }
        );
        res.status(201).json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: "Error Occured" });
    }
};

//forgot password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        let user = await User.findOne({ email: email })
        if (!user) return res.status(400).json({ msg: 'acccount not found' })
        let userId = user._id
        const randomText = crypto.randomBytes(20).toString('hex')
        const resetToken = new ResetToken({
            user: user._id, 
            token: randomText
        })
        await resetToken.save()
        transport.sendMail({
            from: process.env.USER_EMAIL,
            to: user.email,
            subject: "Reset token",
            html: `
              <html>
                <head>
                  <style>
                    /* Add your CSS styles here */
                    body {
                      font-family: Arial, sans-serif;
                      background-color: #f5f5f5;
                      padding: 20px;
                    }
          
                    .container {
                      background-color: #ffffff;
                      border-radius: 8px;
                      padding: 20px;
                      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                    }
          
                    h1 {
                      color: #333;
                    }
          
                    p {
                      color: #666;
                    }
          
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>Password Reset</h1>
                    <p>Hello,</p>
                    <p>We received a request to reset your password. To proceed, please click the button below:</p>
                    <a href="http://localhost:3000/resetPassword?token=${randomText}&userId=${userId}">Reset Password</a>
                    <p>If you did not request a password reset, no further action is needed.</p>
                    <p>Thank you,</p>
                    <p>BlogApp Team</p>
                  </div>
                </body>
              </html>
            `,
          });
          
        return res.status(200).json({ msg: 'check your email to reset password' })

    } catch (err) {
        console.log(err);
        return res.status(500).json({msg:'internal error'})
    }
}

//reset Password
export const resetPassword = async (req, res) => {
    try {
        const { token, userId } = req.query
        if (!token || !userId) return res.status(400).json({ msg: 'invalid request' })

        const user = await User.findOne({ _id: userId })
        if (!user) return res.status(400).json('user not found')
        const resetToken = await ResetToken.findOne({ user: user._id })
        if (!resetToken) return res.status(400).json({ msg: "Already changed password" })
        const isMatch = await bcrypt.compare(token, resetToken.token)
        if (!isMatch) { return res.status(400).json({ msg: 'token is not valid' }) }
        await ResetToken.deleteOne({ user: user._id })

        const { password } = req.body
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        user.password = hashedPassword
        await user.save()

        transport.sendMail({
            from: process.env.USER_EMAIL,
            to: user.email,
            subject: "Your password reset successfull",
            html: `now you can login`
        })
        return res.status(200).json({ msg: 'you can login now' })
    } catch (err) {
        console.log(err);
        return res.status(500).json('internal error')
    }
}

// Google Login

export const googleLogin = async (req, res) => {
    try {
        console.log("kkkkk");
        const authHeader = req.header("Authorization")
        if (!authHeader) return res.status(401).json("you are not google-authenticated")
        const token = authHeader.split(" ")[1];
        const result = Jwt.decode(token)
        const name = result.name
        const userName = result.given_name
        const email = result.email
        const checkUser =await User.findOne({email:email})
        if(checkUser){
            const accessToken = Jwt.sign({
                id: checkUser._id,
                userName: checkUser.userName,
            }, jwt_secret_key)

            return res.status(200).json({ user:checkUser, accessToken })
        }
        const user = await new User({
            name, email, userName,verified:true
        })
        await user.save()
        const accessToken = Jwt.sign({
            id: user._id,
            userName: user.userName,
        }, jwt_secret_key)
        return res.status(200).json({ user, accessToken })
    } catch (err) {
        console.log(err);
        res.status(500).json("internal error")
    }
} 
