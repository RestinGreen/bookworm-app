import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (userId) => {

    return jwt.sign(
        { userId }, process.env.JWT_SECRET, { expiresIn: "15d" }
    )

}

router.post("/register", async (req, res) => {

    try {
        const { email, username, password } = req.body;
        if (!email || !username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        if (username.length < 3) {
            return res.status(400).json({ message: "Username must be at least 3 characters" });
        }
        //check if user exists
        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const existingEmail = await User.findOne({ email: email })
        if (existingEmail) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        //get random avatar from dicebear
        const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

        const user = new User({
            email, username, password,
            profileImage
        })

        await user.save();

        const jwt = generateToken(user._id)
        res.status(201).json(
            {
                jwt,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage,
                    createdAt: user.createdAt
                }
            }
        )

    } catch (error) {
        console.log("Error in register route", error);
        res.status(500).json({ message: "Internal server error" });
    }

})

router.post("/login", async (req, res) => {

    try {
        const { email, password } = req.body;


        if (!email || !password) return res.status(400).json({ message: "All fields are required" });
        const user = await User.findOne({email: email});

        if (!user) return res.status(400).json({message: "Invalid credentials"});
        const isPasswordCorrect = await user.matchPassword(password);
        if (!isPasswordCorrect) return res.status(400).json({message: "Invalid credentials"});

        const jwt = generateToken(user._id);
        res.status(200).json({
            jwt,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.log("Error in login route", error);
        res.status(500).json({ message: "Internal server error" });
    }

})

export default router

