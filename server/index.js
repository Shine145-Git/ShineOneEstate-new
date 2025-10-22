require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const db = require("./config/db");
const routes = require("./Route/route");
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",")

// Initialize Express
const app = express();

// Connect to Database
db();

// Middleware
app.use(express.json());
app.use(cookieParser()); // must be before routes

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Log origin middleware for debugging
app.use((req, res, next) => {
  console.log('Request Origin:', req.headers.origin);
  next();
});

// Routes
app.use("/", routes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});