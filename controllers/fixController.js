const getUrls = require('get-urls');
const normalize = require('normalize-url');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const Fix = mongoose.model('Fix');
const Link = mongoose.model('Link');

// Change this over so that we can use existing normalization / sanitazion methods.
exports.validateFixRequest = (req, res, next) => {
	if (req.body.broken === undefined || req.body.fix === undefined) {
		res.status(406).send({ errorMessage: 'Missing links in request' });
		return;
	}
	next();
};

exports.copyBrokenToUrlProperty = (req, res, next) => {
	req.body.url = req.body.broken;
	next();
}

exports.copyLinkUrlToBrokenProperty = (req, res, next) => {
	req.body.broken = req.body.linkUrl;
	next();
}

exports.copyFixToUrlProperty = (req, res, next) => {
	req.body.url = req.body.fix;
	next();
};

exports.copyLinkUrlToFixProperty = (req, res, next) => {
	req.body.fix = req.body.linkUrl;
	next();
}

exports.checkBrokenLinkIsBroken = async (req, res, next) => {
	const exists = await Link.findOne({ 'link.url': req.body.broken });
	if (exists) {
		res.status(406).send({ errorMessage: 'Broken link is not broken' });
		return;
	}
	next();
};

exports.checkIfFixedBefore = async (req, res, next) => {
	const fixedBefore = await Fix.findOne({ broken: req.body.broken });
	if (fixedBefore) {
		res.status(409).send({ errorMessage: 'This link has already been fixed before'});
		return;
	}
	next();
};

exports.updateExistingLinkAndSendResponse = async (req, res) => {

	// Update old record with a fixed link
	const beforeUpdate = await Link.findOneAndUpdate(
		{ 'next.url': req.body.broken },
		{ 'next.url': req.body.fix },
		{ returnOriginal: true },
	);
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

	// This is the comment data that the broken link was suppose to point to.
	// The "NewLink" is just the result of the (user submitted) fixed link.
	const newLink = await new Link({
		link: {
			url: req.body.fix,
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

	// This is good for keeping track of links that were broken.
	const fixRecord = await new Fix({
		link: beforeUpdate._id,
		broken: beforeUpdate.link.url,
		fixed: newLink.link.url,
	}).save();

	// Send the response we would have sent using link/next.
	const { link, next } = newLink;
	const { fixed, broken } = fixRecord;
	res.json({
		link,
		next,
		message: 'The link was fixed correctly!',
		fixed,
		broken,
	});
};
