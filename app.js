const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const errorHandler = require('./handlers/errorHandler');
const cors = require('cors');

const app = express();

// Says deprecated - is not.
app.use(bodyParser.json());

app.use(cors());

// Handling our own routes.
app.use('/', routes);

app.use(errorHandler.catchInvalidLink);

module.exports = app;
