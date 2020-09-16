const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5797;

// Some fake URL results.
const testUrls = [
	{
		url:
			'https://www.reddit.com/r/aww/comments/hd6xtp/comment/fvk5vao?context=3',
		subreddit_name_prefixed: 'r/DiWHY',
		score: 26,
		author: 'ThickLumber',
		body_html:
			'&lt;div class="md"&gt;&lt;p&gt;Ah, the ol&amp;#39; Reddit &lt;a href="https://www.reddit.com/r/aww/comments/hd6xtp/comment/fvk5vao?context=3"&gt;Clip-a-roo..&lt;/a&gt;&lt;/p&gt;\n&lt;/div&gt;',
		score_hidden: false,
		created_utc: 1592769539,
	},
	{
		url:
			'https://www.reddit.com/r/ShittyLifeProTips/comments/hwotpa/slpt_how_to_sleep_fast_in_5_seconds/fz3m6fq/?context=2',
		subreddit_name_prefixed: 'r/todayilearned',
		score: 51,
		author: 'IM_V_CATS',
		body_html:
			'&lt;div class="md"&gt;&lt;p&gt;Ah, the ol’ Reddit &lt;a href="https://www.reddit.com/r/ShittyLifeProTips/comments/hwotpa/slpt_how_to_sleep_fast_in_5_seconds/fz3m6fq/?context=2"&gt;quack-a-doodle-roo&lt;/a&gt;!&lt;/p&gt;\n&lt;/div&gt;',
		score_hidden: false,
		created_utc: 1595706188,
	},
	{
		url:
			'https://www.reddit.com/r/Mirrorsforsale/comments/hwc9dz/i_guess_they_forgot_that_silver_was_reflectivefz2jc9c/?utm_source=share&amp;utm_medium=ios_app&amp;utm_name=iossmf',
		subreddit_name_prefixed: 'r/ShittyLifeProTips',
		score: 19,
		author: 'DragonSlasher07',
		body_html:
			'&lt;div class="md"&gt;&lt;p&gt;Ah the ol’reddit &lt;a href="https://www.reddit.com/r/Mirrorsforsale/comments/hwc9dz/i_guess_they_forgot_that_silver_was_reflective%0Afz2jc9c/?utm_source=share&amp;amp;utm_medium=ios_app&amp;amp;utm_name=iossmf"&gt;Wall-a-roo!&lt;/a&gt;&lt;/p&gt;\n\n&lt;p&gt;Edit: I have no fucking clue why my comment isn’t working but sorry&lt;/p&gt;\n&lt;/div&gt;',
		score_hidden: false,
		created_utc: 1595605311,
	},
	{
		url:
			'https://www.reddit.com/r/aww/comments/hd6xtp/comment/fvk5vao?context=3',
		subreddit_name_prefixed: 'r/DiWHY',
		score: 26,
		author: 'ThickLumber',
		body_html:
			'&lt;div class="md"&gt;&lt;p&gt;Ah, the ol&amp;#39; Reddit &lt;a href="https://www.reddit.com/r/aww/comments/hd6xtp/comment/fvk5vao?context=3"&gt;Clip-a-roo..&lt;/a&gt;&lt;/p&gt;\n&lt;/div&gt;',
		score_hidden: false,
		created_utc: 1592769539,
	},
];

app.use(cors());
app.use(bodyParser.json());

let counter = -1;

app.post('/url', async (req, res, next) => {
	if (counter < 4) {
		counter += 1;
		try {
			const {
				url,
				subreddit_name_prefixed,
				score,
				author,
				body_html,
				score_hidden,
				created_utc,
			} = testUrls[counter];

			res.json({
				url,
				subreddit_name_prefixed,
				score,
				author,
				body_html,
				score_hidden,
				created_utc,
			});
		} catch (err) {
			res.status(500).send(`Error: ${err}`);
		}
	} else {
		console.log('Stopped! Did the UI detect cycle?');
	}
});

app.get('*', async (req, res, next) => {
	res.send('Page not found').status(404);
});

app.listen(port, () => {
	console.log(`API Test started at http://localhost:${port}`);
});
