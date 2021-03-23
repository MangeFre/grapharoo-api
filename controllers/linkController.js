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

exports.validateLinkUrl = (req, res, next) => {
	const url = new URL(req.body.url);
	if (!url.hostname) {
		const err = new Error('Did you submit an empty URL?');
		next(err);
		return;
	}

	if (url.hostname != 'reddit.com') {
		const err = new Error(`${url} is not a valid domain.`);
		next(err);
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
		const err = new Error(`${req.body.linkUrl} is not a valid grapharoo link.`);
		next(err);
		return;
	}

	const data = await response.json();
	req.body.data = data;
	next();
};

exports.handleNextLink = async (req, res) => {
	const commentData = req.body.data[1].data.children[0].data;
	const nextRaw = new URL(Array.from(getUrls(commentData.body))[0]);
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
