require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const shopRoutes = require("./routes/shopRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

/* ================================
   🔥 CORS MUST BE BEFORE ROUTES
================================= */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

/* ================================
   🔥 ROUTES
================================= */
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/products", productRoutes);

/* ================================
   🔥 MONGO CONNECT
================================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error ❌", err));

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

/// naya change yaha hua hai 

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// 🔥 Make io accessible in routes
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client Connected:", socket.id);
});

const PORT = process.env.PORT || 5055;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
