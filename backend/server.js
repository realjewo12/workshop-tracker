require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
// 1. HTTP Security & Performance Safeguards (Run these first)
app.use(helmet()); // Hides Express identity headers and mitigates web vulnerabilities
app.use(compression()); // Gzip compresses response payloads for faster mobile network loading

// 2. Request Parsing & Body Interceptors
app.use(express.json());
app.use(cookieParser());

// 3. Cross-Origin Resource Sharing (CORS) Configuration
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// 4. Rate Limiting Protection Gateway
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each isolated IP to 100 requests per windowMs
    message: { status: 'error', message: 'Too many requests from this IP, please try again later.' }
});
// Apply the limit specifically to all API v1 routing targets
app.use('/api/v1/', limiter);

// 5. Core Application Routes
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API is running' });
    });

// 6. Global Catch-All Error Handling Middleware
    app.use((err, req, res, next) => {
        console.error(err.stack);
            res.status(500).json({ status: 'error', message: 'Internal Server Error' });
            });

// 7. Server Runtime Initializer
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

        
