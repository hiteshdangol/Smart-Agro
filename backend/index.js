const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDb = require('./config/db');
const pestAlertRoute = require('./routes/pestAlertRoute');
const cropRecommendationRoute = require('./routes/cropRecommendationRoute');
const diseaseRoute = require('./routes/diseaseRoute');
const medicineRoutes = require('./routes/medicineRoutes');

const manualAutomationRoutes = require('./routes/manualAutomationRoutes');
// Import Routes
const authRoutes = require('./routes/authRoutes');
const pestAlertRoutes = require('./routes/pestAlertRoute');
const recordRoutes = require('./routes/recordRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const roleRoutes = require('./routes/roleRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const Role = require('./models/Role');
const { DEFAULT_ROLES } = require('./utils/permissions');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
     origin: '*',
     methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.json());

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(
  cors({
    origin: true, // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Optional: if you plan to use cookies/auth headers
  })
);

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/manual', manualAutomationRoutes);
app.use('/api/pest-alert', pestAlertRoute);
app.use("/api", require("./routes/pestAlertRoute"));
app.use('/api/crop-recommendation', cropRecommendationRoute);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/disease', diseaseRoute);
app.use('/api/medicines', medicineRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Socket.IO for real-time data
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  // Function to generate random values within a specified range
  function getRandomInRange(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
  }

  // Emit sensor data matching the new specified ranges
  const interval = setInterval(() => {
    const sampleData = {
      timestamp: new Date().toISOString(),
      temperature: getRandomInRange(20, 27), // Temperature range: 20-27°C
      humidity: getRandomInRange(40, 75), // Humidity range: 70-85%
      soilMoisture: getRandomInRange(65, 80), // Soil moisture range: 400-600
      lightIntensity: getRandomInRange(400, 600), // Arbitrary light intensity range
    };

    socket.emit('sensor-data', sampleData);
  }, 10000);

  // Clean up on disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(interval);
  });
});

// Add GET endpoint for fetching sensor data (if needed)
app.get('/api/sensor-data', (req, res) => {
  const sampleData = {
    timestamp: new Date().toISOString(),
    temperature: (Math.random() * 40).toFixed(2),
    humidity: (Math.random() * 100).toFixed(2),
    soilMoisture: (Math.random() * 100).toFixed(2),
    lightIntensity: (Math.random() * 1000).toFixed(2),
  };
  res.json(sampleData);
});

// Manual Automation Real-Time Updates
io.on('connection', (socket) => {
  console.log(`Manual Automation client connected: ${socket.id}`);

  // Emit initial pump state when a client connects
  socket.on('get-initial-state', async () => {
    const pumpState = { isOn: false, timer: 0 }; // Fetch or define the initial state
    socket.emit('update-pump-state', pumpState);
  });

  // Listen for pump state updates
  socket.on('update-pump', (data) => {
    const updatedState = { isOn: data.isOn, timer: data.timer };
    io.emit('update-pump-state', updatedState); // Broadcast updated state
  });

  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log(`Manual Automation client disconnected: ${socket.id}`);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', { message: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start the server
const startServer = async () => {
  await connectDb();
  const count = await Role.countDocuments();
  if (count === 0) {
    await Role.insertMany(DEFAULT_ROLES);
    console.log('Default roles seeded');
  } else {
    for (const def of DEFAULT_ROLES) {
      await Role.updateOne(
        { name: def.name },
        { $addToSet: { permissions: { $each: def.permissions } } },
        { upsert: true }
      );
    }
    console.log('Default roles synced');
  }
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};
startServer();




