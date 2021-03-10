const mongoose = require('mongoose');

const linkSchema = mongoose.Schema({
	url: {
		type: String,
		trim: true,
		required: 'You tried submitting an empty url!',
	},
	chains: [mongoose.ObjectId],
	trees: [mongoose.ObjectId],
});

module.exports = mongoose.model('Link', linkSchema);