const chai = require('chai');
const chatHttp = require('chai-http');
chai.use(chatHttp);

// Shorthands (reduce the time we have to type 'chai')
const expect = chai.expect;
const url = `http://localhost:${process.env.PORT || 3000}`;

const brokenTestLink =
	'https://www.reddit.com/r/Mirrorsforsale/comments/hwc9dz/i_guess_they_forgot_that_silver_was_reflective/';
const fixedTestLink =
	'https://www.reddit.com/r/Mirrorsforsale/comments/hwc9dz/i_guess_they_forgot_that_silver_was_reflective/fz2jc9c?utm_source=share&utm_medium=web2x&context=3';
const cleanFixedLink =
	'https://www.reddit.com/r/Mirrorsforsale/comments/hwc9dz/i_guess_they_forgot_that_silver_was_reflective/fz2jc9c';

describe('POST link/fix - testing the ability to fix broken links', function () {
	this.timeout(0);

	it('Broken link submitted, response is a fixed one', (done) => {
		chai
			.request(url)
			.post('/link/fix')
			.send({ broken: brokenTestLink, fix: fixedTestLink })
			.end((err, res) => {
				expect(res.body.broken).to.equal(brokenTestLink);
				expect(res.body.fixed).to.equal(cleanFixedLink);
				done(err);
			});
	});
});
