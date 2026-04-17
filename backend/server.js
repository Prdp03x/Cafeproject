require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const Order = require("./models/Order")
const connectDB = require("./config/db");

const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes")
const auth = require("./middleware/auth");

const app = express();

// Middleware
app.use(cors({
  // origin: ["https://self-service-order-prdp1.vercel.app","http://localhost:5173"]
  origin:"*"
}));
app.use(express.json());
app.use(helmet());

// Routes
app.use("/api/menu", menuRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/auth", authRoutes);

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
};

startServer();
