const getUrls = require('get-urls');
const fetch = require('node-fetch');
const normalize = require('normalize-url');
const mongoose = require('mongoose');
const Link = mongoose.model('Link');

exports.normalizeUrl = (req, res, next) => {
	try {
		req.body.url = normalize(req.body.url, {
			forceHttps: true,
		});
	} catch (err) {
		// The normalizeURL library throws errors, but this is more descriptive.
		const myErr = new Error('The URL was not valid');
		next(myErr);
	}
	next();
};

exports.validateLinkUrl = async (req, res, next) => {
	try {
		const peek = await fetch(req.body.url, { method: 'HEAD' });
		const finalURL = peek.url;
		const url = new URL(finalURL);

		// The final URL hostname should always be reddit.com
		if (!url.hostname.includes('reddit.com')) {
			const err = new Error(`${url} is not a valid domain`);
			next(err);
			return;
		}
	} catch (err) {
		const err2 = new Error('Error trying to peek at submitted url');
		next(err2);
		return;
	}

	next();
};

exports.attachLinkUrl = (req, res, next) => {
	const url = new URL(req.body.url);
	const linkUrl = url.origin + url.pathname;
	req.body.linkUrl = linkUrl;
	next();
};

exports.findInDb = async (req, res, next) => {
	const linkUrl = req.body.linkUrl;
	// Good docs on why this query has to be like this.
	// https://docs.mongodb.com/manual/tutorial/query-embedded-documents/#specify-equality-match-on-a-nested-field
	const existingLink = await Link.findOne({ 'link.url': linkUrl });
	if (existingLink) {
		const { link, next } = existingLink;
		res.json({
			link,
			next,
			seen: true,
		});
		return;
	}
	next();
};

exports.fetchLinkData = async (req, res, next) => {
	const response = await fetch(req.body.linkUrl + '.json', {
		'Content-Type': 'application/json',
	});

	if (response.status !== 200) {
		const err = new Error(`${req.body.linkUrl} is not a valid grapharoo link`);
		next(err);
		return;
	}

	const data = await response.json();
	req.body.data = data;
	next();
};

exports.handleNextLink = async (req, res) => {
	const commentData = req.body.data[1].data.children[0].data;
	// Get an array of strings that look like urls
	const urls = Array.from(getUrls(commentData.body));
	// Find the first URL that contains the substring 'reddit.com'. This may need to be more advanced in the future
	const redditUrl = urls.length > 1 ? urls.find((url) => url.includes('reddit.com')) : urls[0];
	const nextRaw = new URL(redditUrl);
	const nextUrl = nextRaw.origin + nextRaw.pathname;
	const {
		subreddit_name_prefixed,
		score,
		author,
		body_html,
		score_hidden,
		created_utc,
	} = commentData;
	const newLink = await new Link({
		link: {
			url: req.body.linkUrl,
			data: {
				subreddit_name_prefixed,
				score,
				author,
				body_html,
				score_hidden,
				created_utc: new Date(created_utc * 1000),
			},
		},
		next: { url: nextUrl },
	}).save();
	const { link, next } = newLink;
	res.json({ link, next, seen: false });
};
