const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const donorRoutes = require('./routes/donor.routes');
const receiverRoutes = require('./routes/receiver.routes');
const donationRoutes = require('./routes/donation.routes');
const notificationRoutes = require('./routes/notification.route');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Route middleware
app.use('/api/auth', authRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/receiver', receiverRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/notifications', notificationRoutes);
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
