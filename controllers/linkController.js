const getUrls = require('get-urls');
const fetch = require('node-fetch');
const normalize = require('normalize-url');
const mongoose = require('mongoose');
const Link = mongoose.model('Link');

exports.normalizeUrl = (req, res, next) => {
	const urlToNormalize = req.body.url;
	const normalized = normalize(urlToNormalize, { forceHttps: true });
	req.body.url = normalized;
	next();
};

exports.handleNextLinkReq = async (req, res) => {
	const url = new URL(req.body.url);
	const link = url.origin + url.pathname;

	const existingLink = await Link.findOne({ url: link });

	// If this is in our DB, don't ping reddit, just retrieve the DB entry
	if (existingLink) {
		res.json({
			link: { url: existingLink.url },
			next: { url: existingLink.next },
			seen: true,
		});
		return;
	}

	const redditDataRaw = await fetch(link + '.json', {
		'Content-Type': 'application/json',
	});
	const redditData = await redditDataRaw.json();
	const commentData = redditData[1].data.children[0].data;
	const nextRaw = new URL(Array.from(getUrls(commentData.body))[0]);
	const nextUrl = nextRaw.origin + nextRaw.pathname;
	const newLink = new Link({ url: link, next: nextUrl }).save();
	res.json({ link: { url }, next: { url: nextUrl }, seen: false });
};