const chai = require('chai');
const chatHttp = require('chai-http');
chai.use(chatHttp);

// Shorthands (reduce the time we have to type 'chai')
const expect = chai.expect;

// Set up connection string to the test server.
require('dotenv').config({ path: '../.env' });
const url = `localhost:${process.env.TEST_PORT || 7777}`;

describe('Testing the suite, and a simple sample repsonse from server', () => {
	it('Expecting response type JSON', (done) => {
		chai
			.request(url)
			.get('/link/next')
			.send()
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res).to.be.json;
				done();
			});
	});

	it('Expecting response object to say that it works', (done) => {
		chai
			.request(url)
			.get('/link/next')
			.send()
			.end((err, res) => {
				expect(res.body).to.deep.equal({ works: true });
				done();
			});
	});
});
