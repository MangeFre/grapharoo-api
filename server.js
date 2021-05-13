const mongoose = require('mongoose');

// import environmental variables from our variables.env file
require('dotenv').config({ path: '.env' });

// TODO in future - if deployed, set up logic to not use the deployed db for testing
let port = process.env.PORT || 3000;

// ONLY CONNECT TO PROD if PROD is specified in .env
const production = process.env.PROD == 'true';
const dbConnection = production
	? process.env.DATABASE
	: process.env.TEST_DATABASE;

// Connect to our Database and handle any bad connections
mongoose.set('useUnifiedTopology', true);

// See here: https://mongoosejs.com/docs/deprecations.html#findandmodify
mongoose.set('useFindAndModify', false);
try {
	mongoose.connect(dbConnection, { useNewUrlParser: true });
	console.log(`Connected to DB at ${dbConnection}`);
} catch (err) {
	console.log(`Error connecting!!!!!! -> ${err.message}`);
}
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
	console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

require('./models/Link');
require('./models/Fix');

const app = require('./app');
const server = app.listen(port, () => {
	console.log(`Server listening on ${port}`);
});
