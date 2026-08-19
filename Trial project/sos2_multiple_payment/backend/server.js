require("dotenv").config();

const express = require("express");
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");
const { globalLimiter } = require("./middleware/rateLimiters");

const connectDB = require("./config/db");

const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const cafeRoutes = require("./routes/cafeRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const { razorpayWebhook } = require("./controllers/paymentController");

const session = require("express-session");
const passport = require("./config/passport");

const app = express();
const server = http.createServer(app);

const normalizeOrigin = (origin) => origin?.replace(/\/+$/, "");

const parseOrigins = (...values) =>
  values
    .flatMap((value) => (value ? value.split(",") : []))
    .map((value) => normalizeOrigin(value.trim()))
    .filter(Boolean);

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...parseOrigins(
    process.env.CLIENT_URL,
    process.env.CLIENT_URL2,
    process.env.CORS_ORIGINS,
  ),
]);

const corsOrigin = (origin, callback) => {
  if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
    return callback(null, true);
  }
  return callback(new Error(`Origin not allowed by CORS: ${origin}`));
};

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  // console.log("User connected:", socket.id);

  socket.on("joinCafe", (cafeId) => {
    if (!socket.rooms.has(cafeId)) {
      socket.join(cafeId);
      // console.log(`Joined cafe room: ${cafeId}`);
    }
  });

  socket.on("leaveCafe", (cafeId) => {
    socket.leave(cafeId);
    console.log(`Left cafe room: ${cafeId}`);
  });

  socket.on("disconnect", (reason) => {
    console.log("User disconnected", reason);
  });
});

// Razorpay webhook — must read the RAW body for signature verification,
// so this is registered before express.json() parses everything else.
app.use(cors({ origin: corsOrigin, credentials: true }));
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), razorpayWebhook);

// Middleware
app.use(express.json());
app.use(helmet());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(globalLimiter);

// Routes
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cafes", cafeRoutes);
app.use("/api/payments", paymentRoutes);

// Start server
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
};

startServer();
