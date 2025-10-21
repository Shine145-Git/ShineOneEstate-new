require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const db = require("./config/db");
const routes = require("./Route/route");

// Initialize Express
const app = express();

// Connect to Database
db();

// Middleware
app.use(express.json());
app.use(cookieParser()); // must be before routes

const corsOptions = {
  origin: 'https://shineoneestate-new-1.onrender.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", corsOptions.origin);
    res.header("Access-Control-Allow-Methods", corsOptions.methods.join(","));
    res.header("Access-Control-Allow-Headers", corsOptions.allowedHeaders.join(","));
    res.header("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(204);
  }
  next();
});



// Routes
app.use("/", routes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});