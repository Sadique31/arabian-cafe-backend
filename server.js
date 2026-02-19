require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const rateLimit = require("express-rate-limit");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const shopRoutes = require("./routes/shopRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

/* ================================
   CORS
================================= */
app.use(cors({
  origin: ["https://frontend-rouge-phi-32.vercel.app", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());

app.use("/api/auth", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts, please try after 15 minutes" }
}));
/* ================================
   ROUTES
================================= */
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/products", productRoutes);

/* ================================
   MONGO CONNECT
================================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error ❌", err));

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

/* ================================
   SOCKET SETUP (IMPORTANT)
================================= */

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client Connected:", socket.id);
});

const PORT = process.env.PORT || 5055;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
