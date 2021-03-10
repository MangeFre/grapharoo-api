const mongoose = require('mongoose');

// import environmental variables from our variables.env file
require('dotenv').config({ path: '.env' });

// TODO in future - if deployed, set up logic to not use the deployed db for testing
let port = process.env.PORT || 3000;
if (process.env.TEST_ENV) {
	[port] = process.env.npm_package_scripts_ci
		.split(' ')
		.map(parseFloat)
		.filter((port) => !Number.isNaN(port));
}

// Connect to our Database and handle any bad connections
mongoose.set('useUnifiedTopology', true);
try {
	mongoose.connect(process.env.DATABASE, { useNewUrlParser: true });
	console.log('Connected to DB successfully.');
} catch (err) {
	console.log(`Error connecting!!!!!! -> ${err.message}`);
}
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
	console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

require('./models/Link');

const app = require('./app');
const server = app.listen(port, () => {
	console.log(`Server listening on ${port}`);
});
