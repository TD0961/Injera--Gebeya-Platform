const express = require("express");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");

// Load environment variables
dotenv.config();
const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(cors());


// Routes
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("API is running..."); 
});

module.exports = app;