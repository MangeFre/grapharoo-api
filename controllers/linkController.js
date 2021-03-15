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

exports.attachLinkUrl = (req, res, next) => {
	const url = new URL(req.body.url);
	const linkUrl = url.origin + url.pathname;
	req.body.linkUrl = linkUrl;
	next();
};

exports.findInDb = async (req, res, next) => {
	const linkUrl = req.body.linkUrl;
	const existingLink = await Link.findOne({ link: { url: linkUrl } });
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
		next('The provided URL is not reachable');
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
	const newLink = await new Link({
		link: { url: req.body.linkUrl },
		next: { url: nextUrl },
	}).save();
	const { link, next } = newLink;
	res.json({ link, next, seen: false });
};
