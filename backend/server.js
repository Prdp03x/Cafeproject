// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");
// const Order = require("./models/Order")
// const connectDB = require("./config/db");

// const menuRoutes = require("./routes/menuRoutes");
// const orderRoutes = require("./routes/orderRoutes");
// const authRoutes = require("./routes/authRoutes")
// const auth = require("./middleware/auth");

// const app = express();

// // Middleware
// app.use(cors({
//   // origin: ["https://self-service-order-prdp1.vercel.app","http://localhost:5173"]
//   origin:"*"
// }));
// app.use(express.json());
// app.use(helmet());

// // Routes
// app.use("/api/menu", menuRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/auth", authRoutes);

// const startServer = async () => {
//   await connectDB();

//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT, () => console.log(`Server running on ${PORT}`));
// };

// startServer();
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const server = http.createServer(app); // ✅ IMPORTANT

// 🔥 SOCKET SETUP
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// 🔥 MAKE IO GLOBAL
app.set("io", io);

// 🔥 SOCKET EVENTS
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinCafe", (cafeId) => {
    socket.join(cafeId);
    console.log(`Joined cafe room: ${cafeId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(helmet());

// Routes
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);

// 🔥 START SERVER (IMPORTANT CHANGE)
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
};

startServer();