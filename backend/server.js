const express = require("express");
const { connectDB } = require("./config/db");
const app = express();

connectDB();

app.use(express.json());
// app.use("/api/leads", require("./routes/leadRoutes"));
app.use("/auth", require("./routes/authRoutes"))

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server Running on Port", PORT));
