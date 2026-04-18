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
const cafeRoutes = require("./routes/cafeRoutes")

const session = require("express-session");
const passport = require("./config/passport");


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
    if (!socket.rooms.has(cafeId)) {
      socket.join(cafeId);
      console.log(`Joined cafe room: ${cafeId}`);
    }
  });

  socket.on("leaveCafe", (cafeId) => {
    socket.leave(cafeId);
    console.log(`Left cafe room: ${cafeId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(helmet());
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cafes", cafeRoutes);


// 🔥 START SERVER (IMPORTANT CHANGE)
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
};

startServer();
