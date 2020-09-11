const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5797;

// const defaultUrl =
// 	'https://www.reddit.com/r/nyc/comments/ifd65i/new_friends_on_my_fire_escape/g2nl50x/?context=2';

app.use(cors());
app.use(bodyParser.json());

app.post('/url', async (req, res, next) => {
	try {
		let { url } = req.body;
		if (isBlank(url)) {
			console.log('URL is blank');
			res.status(404).send('URL is blank');
			return;
		}
		// This is the whole page as data. It's not really what we want.
		const data = await getPostAsJson(url);

		// Gets the comment - All the juicy data we may want.
		const comment = getCommentInPostDataJson(data);

		// This is just the text of the comment - perfect to extract the next link from.
		const commentBody = comment.body;
		const indexOfHttp = commentBody.indexOf('(http');
		// Don't want the ( so we add one.
		const link =
			indexOfHttp > -1
				? commentBody.substring(indexOfHttp + 1)
				: 'No Link Found';
		// This link will have a ) at the end. We find it and remove it.
		const trimmedLink = link.substring(0, link.indexOf(')'));

		// Some fun properties in the comment.
		const { subreddit_name_prefixed, score, author, body_html } = comment;

		res.json({ url: trimmedLink, subreddit_name_prefixed, score, author, body_html });
	} catch (err) {
		res.status(500).send(`Error: ${err}`);
	}
});

app.get('*', async (req, res, next) => {
	res.send('Page not found').status(404);
});

app.listen(port, () => {
	console.log(`API Test started at http://localhost:${port}`);
});

function isBlank(str) {
	return !str || /^\s*$/.test(str);
}

function trimLink(link) {
	// Think this regex will split on / and ?
	const URLarray = link.split(/[/?]/);

	// The 'interesting' part is 7 characters long, always, however we don't know where it is....
	const linkEndOfInterestArray = URLarray.filter((possibleFullname) => {
		return possibleFullname.length === 7;
	});

	// MOST LIKELY this is enough for now but... Yeah. Not sure how to check for it.
	const linkEndOfInterest =
		linkEndOfInterestArray[linkEndOfInterestArray.length - 1];

	// A little wonky, but will return the correct substring
	const trimmedLink = link.substring(0, link.indexOf(linkEndOfInterest) + 7);
	return trimmedLink;
}

async function getPostAsJson(link) {
	const trimmedLink = trimLink(link);
	const jsonLink = trimmedLink + '.json';
	const response = await fetch(jsonLink, {
		'Content-Type': 'application/json',
	});

	const data = response.json();
	return data;
}

// A post contains a lot of stuff. This aims to find the comment of interest
// Returns it as a json object.
function getCommentInPostDataJson(dataAsJson) {
	const postComments = dataAsJson[1];
	const commentData = postComments.data.children[0].data;
	return commentData;
}
