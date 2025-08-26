import express from "express"
import "dotenv/config"
import authRoutes from "./routes/authRoutes.js"
import bookRoutes from "./routes/bookRoutes.js"
import { connectDB } from "./lib/db.js"
import cors from "cors"


const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use("/api/auth", authRoutes)
app.use("/api/books", bookRoutes)


app.listen(PORT, () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`)
  console.log(`Server accessible at:`)
  console.log(`- Local: http://localhost:${PORT}`)
  console.log(`- Network: http://0.0.0.0:${PORT}`)
  connectDB()
})