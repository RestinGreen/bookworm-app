import express from "express"
import cloudinary from "../lib/cloudinary.js"
import Book from "../models/Book.js"
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
    try {
        const {title, caption, rating, image} = req.body;
        if (!title || !caption || !rating || !image) {
            return res.status(400).json({error: "All fields are required"});
        }

        //upload image to cloudinary
        const uploadedResponse =await cloudinary.uploader.upload(image)
        const imageUrl = uploadedResponse.secure_url;
        //save to db
        
        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id
        })
        await newBook.save();
        res.status(201).json(newBook);

    } catch (error) {
        console.log("Error creating book:", error);
        res.status(500).json({error: "Internal server error"});
    }
})

export default router;
