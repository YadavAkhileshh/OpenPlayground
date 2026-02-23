const express = require('express');
const cors = require('cors');
require('dotenv').config();

const snippetRoutes = require('./routes/snippetRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const tagRoutes = require('./routes/tagRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/snippets', snippetRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/tags', tagRoutes);

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
