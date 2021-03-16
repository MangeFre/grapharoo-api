const mongoose = require('mongoose');

const linkSchema = mongoose.Schema({
	link: {
		url: {
			type: String,
			trim: true,
			required: 'You tried submitting an empty url!',
		},
		data: {
			subreddit_name_prefixed: {
				type: String,
			},
			score: {
				type: Number,
			},
			author: {
				type: String,
			},
			body_html: {
				type: String,
			},
			score_hidden: {
				type: Boolean,
			},
			created_utc: {
				type: Date,
			},
		},
	},
	next: {
		url: {
			type: String,
			trim: true,
			required: 'You have to supply the next link in the chain',
		},
	},
	chains: [mongoose.ObjectId],
	trees: [mongoose.ObjectId],
});

module.exports = mongoose.model('Link', linkSchema);
