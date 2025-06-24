const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require('dotenv').config(); // Load environment variables
const { dbConnect } = require("../models/db");
const skillRoutes = require("../routes/skillRoutes");
const authRoutes = require("../routes/authRoutes");
const errorHandler = require("../middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

dbConnect();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL, 
  credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Skill Tree API is running'
  });
});

app.use(errorHandler);

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
    console.log(`🚀 Skill Tree API running on port ${PORT}`);
});