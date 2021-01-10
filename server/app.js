const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(morgan('tiny'));
app.use(express.json());

app.use('/api', require('./api'));

module.exports = app;
