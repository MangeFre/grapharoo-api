const fetch = require('node-fetch');
const chai = require('chai');
const mongoose = require('mongoose');
require('../models/Link');
require('../models/Fix');
const Link = mongoose.model('Link');
const Fix = mongoose.model('Fix');

// Shorthands (reduce the time we have to type 'chai')
const expect = chai.expect;
let noTestsFailed = true;

// import environmental variables from our variables.env file
require('dotenv').config({ path: '.env' });
const dbConnection = `${process.env.TEST_DATABASE}-fixModel`;

describe('Testing the exists function', function () {
	this.timeout(0);

	before((done) => {
		// Connect to our Database and handle any bad connections
		mongoose.set('useUnifiedTopology', true);

		// See here: https://mongoosejs.com/docs/deprecations.html#findandmodify
		mongoose.set('useFindAndModify', false);

		try {
			mongoose.connect(dbConnection, {
				useNewUrlParser: true,
			});
			console.log(`Connecting to db at ${dbConnection}. Should pause tests.`);
		} catch (err) {
			console.log(`Error connecting!!!!!! -> ${err.message}`);
		}
		mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
		mongoose.connection.on('error', (err) => {
			console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
		});

		mongoose.connection.on('open', () => {
			console.log('Connection open, resume testing.');
			done();
		});
	});

	it('Testing inserting is working', async () => {
		const inserted = await Fix({ broken: 'test', fixed: 'also test' }).save();
		const sameAsInserted = await Fix.findOne({ _id: inserted._id });
		expect(sameAsInserted._id).to.be.deep.equal(inserted._id);
	});

	afterEach(function () {
		if (this.currentTest.state === 'failed') {
			noTestsFailed = false;
		}
	});

	after(async function () {
		if (noTestsFailed) {
			console.log('All tests passed - Removing test database.');
			await mongoose.connection.db.dropDatabase();
		} else {
			console.log(
				'Some tests passed - The database has been kept to investigate.',
			);
		}

		await mongoose.disconnect();
	});
});
