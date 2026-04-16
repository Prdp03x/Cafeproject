require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const Order = require("./models/Order")
const connectDB = require("./config/db");

const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

// Middleware
// app.use(cors({
//   origin: "https://self-service-order-prdp1.vercel.app"
// }));
const allowedOrigins = [
  "http://localhost:5173",
  "https://self-service-order-prdp1.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));
app.use(express.json());
app.use(helmet());

// Routes
app.use("/api/menu", menuRoutes);
app.use("/api/order", orderRoutes);
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
};



startServer();
