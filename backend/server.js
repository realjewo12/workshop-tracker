require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API is running' });
    });

    app.use((err, req, res, next) => {
        console.error(err.stack);
            res.status(500).json({ status: 'error', message: 'Internal Server Error' });
            });

            const PORT = process.env.PORT || 3000;
            app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

        