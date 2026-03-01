const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mock System Intelligence
app.get('/api/health', (req, res) => {
    res.json({
        status: 'Operational',
        uptime: process.uptime(),
        latency: Math.floor(Math.random() * 50) + 10 + 'ms',
        timestamp: new Date().toISOString()
    });
});

// Mock Activity Feed
app.get('/api/activity', (req, res) => {
    const activities = [
        { id: 1, type: 'DEPLOY', message: 'Production deployment successful', time: '2m ago' },
        { id: 2, type: 'ALERT', message: 'High latency detected in US-East-1', time: '5m ago' },
        { id: 3, type: 'COMMIT', message: 'New commit in repository "nexus-core"', time: '12m ago' },
    ];
    res.json(activities);
});

app.listen(PORT, () => {
    console.log(`Nexus Server running on port ${PORT}`);
});
