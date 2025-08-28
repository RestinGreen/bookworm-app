import express from "express"
import "dotenv/config"
import authRoutes from "./routes/authRoutes.js"
import bookRoutes from "./routes/bookRoutes.js"
import { connectDB } from "./lib/db.js"
import cors from "cors"
import { readFileSync } from "fs";
import { join } from "path";


const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

app.use("/api/auth", authRoutes)
app.use("/api/books", bookRoutes)


// Landing page for all non-existing routes
app.use((req, res) => {
  const landingPagePath = join(process.cwd(), "src", "landingPage.html");
  const html = readFileSync(landingPagePath, "utf8");
  res.status(200).send(html);
});


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`)
  console.log(`Server accessible at:`)
  console.log(`- Local: http://localhost:${PORT}`)
  console.log(`- Network: http://0.0.0.0:${PORT}`)
  connectDB()
})  