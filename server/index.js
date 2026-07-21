const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const analyzerRoutes = require('./routes/analyzer');
const simulatorRoutes = require('./routes/simulator');
const statsRoutes = require('./routes/stats');
const virusTotalRoutes = require('./routes/virustotal');
const owaspRoutes = require('./routes/owasp');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analyzer', analyzerRoutes);
app.use('/api/simulator', simulatorRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/virustotal', virusTotalRoutes);
app.use('/api/owasp', owaspRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'CyberGuard API running' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cyberguard')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`CyberGuard server running on port ${PORT}`));
