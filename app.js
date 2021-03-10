const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Says deprecated - is not.
app.use(bodyParser.json());

// Handling our own routes.
app.use('/', routes);

module.exports = app;
