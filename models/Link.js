const mongoose = require('mongoose');
const fuzzy_search = require('mongoose-fuzzy-searching');

function getPostAndCommentId(fullUrl) {
	const destructuredURL = new URL(fullUrl);
	const path = destructuredURL.pathname;
	const trimmed = path.slice(path.indexOf('comments/'));
	const allParameters = trimmed.split('/');
	return [allParameters[1], allParameters[3]];
}

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

linkSchema.index({
	'link.structured.post_id': 1,
	'link.structured.comment_id': 1,
});

linkSchema.index({
	'next.url': 'text',
});

linkSchema.pre('findOne', function () {
	// 'This' is the QUERY object
	if (Object.keys(this._conditions).includes('link.url')) {
		const [post_id, comment_id] = getPostAndCommentId(
			this._conditions['link.url'],
		);
		this._conditions = {
			'link.structured.post_id': post_id,
			'link.structured.comment_id': comment_id,
		};
	}
});

linkSchema.pre('save', function () {
	const path = new URL(this.link.url).pathname;
	const [post_id, comment_id] = getPostAndCommentId(this.link.url);
	// 'This' is the document being saved.
	this.link.structured.path = path;
	this.link.structured.post_id = post_id;
	this.link.structured.comment_id = comment_id;
});

module.exports = mongoose.model('Link', linkSchema);
