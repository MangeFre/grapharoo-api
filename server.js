const mongoose = require('mongoose');

// import environmental variables from our variables.env file
require('dotenv').config({ path: '.env' });

mongoose.set('useUnifiedTopology', true);
// Connect to our Database and handle any bad connections
try {
	mongoose.connect(process.env.DATABASE, { useNewUrlParser: true });
	console.log('Connected to DB successfully.');
} catch (err) {
	console.log(`Error connection!!!!! -> ${err.message}`);
}
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
	console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

require('./models/Link');

const app = require('./app');
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`Server listening on ${port}`);
});
