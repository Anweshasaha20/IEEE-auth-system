import express from "express";
import cookieParser from "cookie-parser";
import routes from "./routes/index.router.js";
import verifyJWT from "./middleware/veifyJWT.js";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", routes);
app.get("/me", verifyJWT, async (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const userData = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Authenticated",
      userId: userData.id,
      username: userData.username,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
