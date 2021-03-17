const chai = require('chai');
const chatHttp = require('chai-http');
chai.use(chatHttp);

// Shorthands (reduce the time we have to type 'chai')
const expect = chai.expect;

// Set up connection string to the test server.
require('dotenv').config({ path: '../.env' });
const url = `http://localhost:${process.env.PORT || 3000}`;

const testURL = 'https://www.reddit.com/r/aww/comments/hd6xtp/comment/fvk5vao';

describe('POST link/next route', function () {
	// Avoid timeout from network calls. This affects the whole suite.
	this.timeout(0);

	it("Link has not been seen - Seen should be 'false'", (done) => {
		chai
			.request(url)
			.post('/link/next')
			.send({ url: testURL })
			.end((err, res) => {
				expect(res?.body?.seen).to.be.false;
				done(err);
			});
	});

	it("Link that has been seen is sent back as 'seen'.", (done) => {
		chai
			.request(url)
			.post('/link/next')
			.send({
				url: `${testURL}?context=3`,
			})
			.end((err, res) => {
				expect(res?.body?.seen).to.be.true;
				done(err);
			});
	});

	it("Response includes a 'link' object", (done) => {
		chai
			.request(url)
			.post('/link/next')
			.send({
				url: testURL,
			})
			.end((err, res) => {
				expect(res?.body?.link).deep.not.to.be.an('undefined');
				done(err);
			});
	});

	it("Response includes a 'next' object", (done) => {
		chai
			.request(url)
			.post('/link/next')
			.send({
				url: testURL,
			})
			.end((err, res) => {
				expect(res?.body?.next).deep.not.to.be.an('undefined');
				done(err);
			});
	});

	it('Valid link, expecting the next link in response', (done) => {
		chai
			.request(url)
			.post('/link/next')
			.send({
				url: testURL,
			})
			.end((err, res) => {
				expect(res?.body?.next?.url).to.equal(
					'https://reddit.com/r/pics/comments/hd4tek/comment/fvjpc68',
				);
				done(err);
			});
	});

	it('Link with context, expecting the next link in response', (done) => {
		chai
			.request(url)
			.post('/link/next')
			.send({
				url: `${testURL}?context=3`,
			})
			.end((err, res) => {
				expect(res?.body?.next?.url).to.equal(
					'https://reddit.com/r/pics/comments/hd4tek/comment/fvjpc68',
				);
				done(err);
			});
	});

	it('Non-working link, return 500 status code', (done) => {
		chai
			.request(url)
			.post('/link/next')
			.send({ url: 'https://reddit.com/r/akfgwauifgweahyfshfkawhfka' })
			.end((err, res) => {
				expect(res.status).to.be.equal(500);
				done(err);
			});
	});

	it('Non-working link, return err message status code', (done) => {
		chai
			.request(url)
			.post('/link/next')
			.send({ url: 'https://reddit.com/r/akfgwauifgweahyfshfkawhfka' })
			.end((err, res) => {
				expect(res.error.text).to.be.equal(
					'ERROR! Message: https://reddit.com/r/akfgwauifgweahyfshfkawhfka is not a valid grapharoo link.',
				);
				done(err);
			});
	});

	it('Incorrect domain.', (done) => {
		chai
			.request(url)
			.post('/link/next')
			.send({ url: 'https://youtube.com/' })
			.end((err, res) => {
				expect(res.error.text).to.be.equal(
					'ERROR! Message: https://youtube.com/ is not a valid domain.',
				);
				done(err);
			});
	});

	it('Empty link url.', (done) => {
		chai
			.request(url)
			.post('/link/next')
			.send({ url: '' })
			.end((err, res) => {
				expect(res.error.text).to.be.equal(
					'ERROR! Message: The URL was not valid',
				);
				done(err);
			});
	});

	it('Storing time/date correctly', (done) => {
		chai
			.request(url)
			.post('/link/next')
			.send({ url: `${testURL}` })
			.end((err, res) => {
				const posted = res.body.link.data.created_utc;
				expect(new Date(posted).toDateString()).to.include('2020');
				done(err);
			});
	});
});
