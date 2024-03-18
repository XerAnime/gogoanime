/* eslint-disable prettier/prettier */
require('dotenv').config({ path: './config.env' });
const app = require('../app');

const port = 8000;

// Starting Server
const server = app.listen(port, () => {
  console.log(`[+] Server started on Port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.mesaage);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.log('uncaught expection occurred');
  console.log(err.name, err.mesaage);
  server.close(() => {
    process.exit(1);
  });
});
