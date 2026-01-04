const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Import logger
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads folder
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Routes
const accountRoutes = require('./routes/accounts');
const postRoutes = require('./routes/posts');

app.use('/api/accounts', accountRoutes);
app.use('/api/posts', postRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(`Server error: ${err.message}`);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  logger.success(`🚀 Server running on port ${PORT}`);
  logger.info(`📡 API available at http://localhost:${PORT}/api`);
  logger.info(`📁 Uploads available at http://localhost:${PORT}/uploads`);
  console.log(`\n✅ Backend started successfully!`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET    /api/health`);
  console.log(`   GET    /api/accounts`);
  console.log(`   POST   /api/accounts`);
  console.log(`   PUT    /api/accounts/:id`);
  console.log(`   DELETE /api/accounts/:id`);
  console.log(`   POST   /api/posts/create`);
  console.log(`\n🔧 Press Ctrl+C to stop\n`);
});