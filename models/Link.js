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
		structured: {
			path: { type: String },
			post_id: { type: String },
			comment_id: { type: String },
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

linkSchema.pre('save', function () {
	const destructuredURL = new URL(this.link.url);
	const path = destructuredURL.pathname;
	const trimmed = path.slice(path.indexOf('comments/'));
	const allParameters = trimmed.split('/');
	const [post_id, comment_id] = [allParameters[1], allParameters[3]];
	this.link.structured.path = path;
	this.link.structured.post_id = post_id;
	this.link.structured.comment_id = comment_id;
});

module.exports = mongoose.model('Link', linkSchema);
