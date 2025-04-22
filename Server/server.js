const app = require("./app");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Connect to the database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});