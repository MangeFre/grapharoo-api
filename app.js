const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const errorHandler = require('./handlers/errorHandler');
const cors = require('cors');

const app = express();

// Says deprecated - is not.
app.use(bodyParser.json());

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization',
	);
	if (req.method == 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
		return res.status(200).json({});
	}

	next();
});

// Handling our own routes.
app.use('/', routes);

app.use(errorHandler.catchInvalidLink);

module.exports = app;
