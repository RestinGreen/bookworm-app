import jwt from "jsonwebtoken";
import User from "../models/User.js";
import "dotenv/config"

const protectRoute = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        
        if (!authHeader) {
            return res.status(401).json({ message: "No authorization header, authorization denied" });
        }

        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Invalid authorization format. Use 'Bearer <token>'" });
        }

        const token = authHeader.replace("Bearer ", "");

        //get token
        if (!token || token.trim() === "" || token === "null") {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        // Check if token looks like a JWT (3 parts separated by dots)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            console.log('Token is in wrong format:', tokenParts);
            return res.status(401).json({ message: "Malformed token format" });
        }

        // Log token for debugging (remove in production)
        console.log("Token received:", token.substring(0, 20) + "...");
        
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //find user
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Token is not valid" });
        }
        req.user = user;
        next();

    } catch (error) {
        console.error("Authentication error:", error);
        res.status(401).json({ message: "Token is not valid" });
    }
}

export default protectRoute;