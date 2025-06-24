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

// Connect to database
dbConnect();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // React dev server
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Skill Tree API is running'
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
    console.log(`🚀 Skill Tree API running on port ${PORT}`);
    console.log('📊 Current NODE_ENV:', process.env.NODE_ENV);
    console.log('🔗 API Base URL: http://localhost:' + PORT + '/api');
});