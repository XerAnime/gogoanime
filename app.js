/* eslint-disable prettier/prettier */
const express = require('express');
const cors = require('cors');
const apiRouter = require('./Routes/apiRouter');

const app = express();

// Body Parser:
app.use(express.json());

// CORS
app.use(cors());

// Api Endpoints

app.use('/api/v1', apiRouter);

app.all('*', (req, res) => {
  res.status(200).json({
    status: 'Success',
    message: 'Your IP has been Logged',
  });
});

module.exports = app;
