import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

// const { Pool } = require('pg');
// const pool = new Pool({
//   user: 'your_username',
//   password: 'your_password',
//   host: 'your_host',
//   port: 'your_port',
//   database: 'your_database',
// });

/* READ */
export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        res.status(200).json(user);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

// const getUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Connect to the database
//     const client = await pool.connect();

//     // Query the user by id
//     const query = 'SELECT * FROM users WHERE id = $1';
//     const values = [id];
//     const result = await client.query(query, values);

//     // Release the database connection
//     client.release();

//     // Get the first row from the result
//     const user = result.rows[0];

//     res.status(200).json({
//       user,
//     });
//   } catch (err) {
//     res.status(404).json({ message: err.message });
//   }
// };


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
                    console.log('callingggggggggggg');
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
        // if (user && user.profilePic) {
        //     cloudinary.uploader.destroy(user.profilePic_PublicId, (error, result) => {
        //         if (error) {
        //             return res.status(400).json("profilepic not updated try later..")
        //         }
        //     });
        // }
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