import express from "express"
import cloudinary from "../lib/cloudinary.js"
import Book from "../models/Book.js"
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;
        if (!title || !caption || !rating || !image) {
            return res.status(400).json({ error: "All fields are required" });
        }

        //upload image to cloudinary
        const uploadedResponse = await cloudinary.uploader.upload(image)
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
        res.status(500).json({ error: "Internal server error" });
    }
})

router.get("/", protectRoute, async (req, res) => {

    try {
        const books = await Book.find().sort({ createdAt: -1 })

        const page = req.query.page || 1
        const limit = req.query.limit || 5
        skip = (page - 1) * limit
            .skip(skip)
            .limit(limit)
            .populate("user", "username profileImage")

        const totalBooks = await Book.countDocuments()

        res.send({
            books,
            currentPage: page,
            totalBooks: totalBooks,
            totalPages: Math.ceil(totalBooks / limit)
        })

    } catch (error) {
        console.log("Error fetching books:", error);
        res.status(500).json({ error: "Internal server error" });
    }

})

router.delete("/:id", protectRoute, async (req, res) => {

    try {
        
        const book = await Book.findById(req.params.id)
        if (!book) {
            return res.status(404).json({ error: "Book not found" });
        }
        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to delete this book" });
        }

        //delete the image from cloudinary

        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split("/").pop().split(".")[0]
                await cloudinary.uploader.destroy(publicId)
                
            } catch (deleteError) {
                console.log("Error delecint image from couldinary", deleteError)
            }
        }
        await book.deleteOne()
        res.json({ message: "Book deleted successfully" });

    } catch (error) {
        console.log("Error deleting book:", error);
        res.status(500).json({ error: "Internal server error" });
    }

})

export default router;
