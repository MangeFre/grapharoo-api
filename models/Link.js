const mongoose = require('mongoose');

const linkSchema = mongoose.Schema({
	url: {
		type: String,
		trim: true,
		required: 'You tried submitting an empty url!',
	},
	next: {
		type: String,
		trime: true,
		required: 'You have to supply the next link in the chain',
	},
	chains: [mongoose.ObjectId],
	trees: [mongoose.ObjectId],
});

module.exports = mongoose.model('Link', linkSchema);