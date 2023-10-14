import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        res.status(200).json(user);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

export const getUsers = async (req, res) => {
    try {
        const user = await User.find({});
        res.status(200).json(user);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            userName,
            email,
            phoneNumber,
            bio,
            oldPassword,
            newPassword,
            confirmPassword,
        } = req.body;

        let user = await User.findById(id);
        if (user) {
            console.log(user);
            user.userName = userName.trim() || user.userName;
            user.name = name.trim() || user.name;
            user.bio = bio.trim() || user.bio;
            user.email = email.trim() || user.email;
            user.phoneNumber = phoneNumber || user.phoneNumber;
            if (oldPassword) {
                const isMatch = await bcrypt.compare(oldPassword, user.password);
                if (!isMatch){
                    return res.status(400).json({ error: "Invalid Old Password. " });
                }

                if (newPassword == confirmPassword) {
                    const salt = await bcrypt.genSalt();
                    const passwordHash = await bcrypt.hash(confirmPassword, salt);
                    user.password = passwordHash;
                } else {
                    return res
                        .status(400)
                        .json({ error: "Old password not same to new password" });
                }
            }

            const updatedUser = await user.save(); // Save the changes to the user object
            res.status(200).json(updatedUser);
        }
    } catch (err) {
        console.log(err);
        res.status(404).json({ error: "something not good" });
    }
};

export const addProfilepPic = async (req, res) => {
    try {
        const { userId } = req.body
        const user = await User.findById(userId)
        let result = await cloudinary.uploader.upload(req.file.path)
        const { secure_url, public_id } = result;
        let updatedUser = await User.findByIdAndUpdate(userId,
            {
                $set: { 
                    profilePic: secure_url,  
                    profilePic_PublicId: public_id
                } 
            }, { new: true })
       return res.status(200).json(updatedUser)
    } catch (err) { 
        console.log(err);
        return res.status(500).json('internal error occured')  
    } 
}

export const getAllUsers = async (req, res) => {
    try {
        const { id, userName } = req.user
        const allusers = await User.find().select('userName profilePic name')

        return res.status(200).json({ data: allusers })
    } catch (err) {
        console.log(err);
        return res.status(500).json('internal error occured')
    }
}
