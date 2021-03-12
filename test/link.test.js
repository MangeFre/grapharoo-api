const chai = require('chai');
const chatHttp = require('chai-http');
chai.use(chatHttp);

// Shorthands (reduce the time we have to type 'chai')
const expect = chai.expect;

// Set up connection string to the test server.
require('dotenv').config({ path: '../.env' });
const url = `localhost:${process.env.TEST_PORT || 7777}`;

const testURL = 'https://www.reddit.com/r/aww/comments/hd6xtp/comment/fvk5vao';

describe('Testing the GET link/next route', function () {
	it("Link has not been seen - Seen should be 'false'", (done) => {
		chai
			.request(url)
			.get('/link/next')
			.send({ url: testURL })
			.end((err, res) => {
				expect(res?.body?.seen).to.be.false;
				done();
			});
	});

	it("Testing that link that has been seen is sent back as 'seen'.", (done) => {
		chai
			.request(url)
			.get('/link/next')
			.send({
				url: `${testURL}?context=3`,
			})
			.end((err, res) => {
				expect(res?.body?.seen).to.be.true;
				done();
			});
	});

	it("Response includes a 'link' object", (done) => {
		chai
			.request(url)
			.get('/link/next')
			.send({
				url: testURL,
			})
			.end((err, res) => {
				expect(res?.body?.link).deep.not.to.be.an('undefined');
				done();
			});
	});

	it("Response includes a 'next' object", (done) => {
		chai
			.request(url)
			.get('/link/next')
			.send({
				url: testURL,
			})
			.end((err, res) => {
				expect(res?.body?.next).deep.not.to.be.an('undefined');
				done(err);
			});
	});

	it('Testing a valid link, expecting the next link in response', (done) => {
		chai
			.request(url)
			.get('/link/next')
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

	it('Testing with context, expecting the next link in response', (done) => {
		chai
			.request(url)
			.get('/link/next')
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
});
