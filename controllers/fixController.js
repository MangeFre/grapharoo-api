const getUrls = require('get-urls');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const Fix = mongoose.model('Fix');
const Link = mongoose.model('Link');

// Change this over so that we can use existing normalization / sanitazion methods.
exports.validateFixRequest = (req, res, next) => {
	if (req.body.broken === undefined || req.body.fix === undefined) {
		res.status(406).send('Missing links in request');
		return;
	}
	next();
};

exports.copyFixToUrlProperty = (req, res, next) => {
	req.body.url = req.body.fix;
	next();
};

exports.checkBrokenLinkIsBroken = async (req, res, next) => {
	const exists = await Link.findOne({ 'link.url': req.body.url });
	if (exists) {
		res.status(406).send('Broken link is not broken');
		return;
	}
	next();
};

exports.checkIfFixedBefore = async (req, res, next) => {
	const fixedBefore = await Fix.findOne({ broken: req.body.url });
	if (fixedBefore) {
		res.status(409).send('This link has already been fixed before');
		return;
	}
	next();
};

exports.updateExistingLinkAndSendResponse = async (req, res) => {
	// Update old record with a fixed link
	const beforeUpdate = await Link.findOneAndUpdate(
		{ $text: { $search: req.body.broken } },
		{ 'next.url': req.body.linkUrl },
		{ returnOriginal: true },
	);

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

	// This is the comment data that the broken link was suppose to point to.
	// The "NewLink" is just the result of the (user submitted) fixed link.
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

	// This is good for keeping track of links that were broken.
	const fixRecord = await new Fix({
		link: beforeUpdate._id,
		broken: beforeUpdate.next.url,
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
