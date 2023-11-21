const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(cors({
    origin: true
}));

app.use(
    bodyParser.json({
        verify: function(req, res, buf) {
            req.rawBody = buf;
        }
    })
);

// Auth Routes
app.use('/auth', require('./Routes/Auth'));

// Tricks Routes
app.use('/tricks', require('./Routes/Tricks'));

app.listen(8000, () => {
    console.log(`Server is listening on port: ${process.env.PORT}`);
});