const getUrls = require('get-urls');
const normalize = require('normalize-url');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const Fix = mongoose.model('Fix');
const Link = mongoose.model('Link');

const isValidRedditLink = async (validationUrl) => {
	try {
		const peek = await fetch(validationUrl, { method: 'HEAD' });
		const finalURL = peek.url;
		const url = new URL(finalURL);

		// The final URL hostname should always be reddit.com
		if (!url.hostname.includes('reddit.com')) {
			return false;
		}
	} catch (err) {
		return false;
	}
};

// Change this over so that we can use existing normalization / sanitazion methods.
exports.validateFixRequest = (req, res, next) => {
	if (req.body.broken === undefined || req.body.fix === undefined) {
		res.status(406).send({ errorMessage: 'Missing links in request' });
		return;
	}
	next();
};

exports.copyFixToUrlProperty = (req, res, next) => {
	req.body.url = req.body.fix;
	next();
};

exports.copyLinkUrlToFixProperty = (req, res, next) => {
	req.body.fix = req.body.linkUrl;
	next();
};

exports.checkBrokenLinkIsNotAlreadyInLinksAsValidLink = async (
	req,
	res,
	next,
) => {
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
		// Check if the previous fix seems to be a legit link.
		if (await isValidRedditLink(fixedBefore.fixed)) {
			res.status(406).send({ errorMessage: 'Broken link is not broken' });
			return;
		}
		// If it was not a legit link, we'll continue and update it.
		req.body.hasBeenFixedBefore = true;
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
	const redditUrl =
		urls.length > 1 ? urls.find((url) => url.includes('reddit.com')) : urls[0];
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
	let newLink;

	// If the fixed link is already in our DB, we just want to point to that.
	const existingLink = await Link.findOne({ 'link.url': req.body.fix });
	if (existingLink !== null) {
		newLink = existingLink;
	} else {
		newLink = await new Link({
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
	}

	let fixRecord;
	if (req.body.hasBeenFixedBefore === true) {
		fixRecord = await Fix.findOneAndUpdate(
			{ broken: req.body.broken },
			{ fixed: newLink.link.url },
			{ returnOriginal: false },
		);
	} else {
		fixRecord = await new Fix({
			link: beforeUpdate._id,
			broken: beforeUpdate.link.url,
			fixed: newLink.link.url,
		}).save();
	}

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
