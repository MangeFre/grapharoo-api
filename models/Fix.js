const mongoose = require('mongoose');

const fixSchema = mongoose.Schema({
	link: mongoose.ObjectId,
	broken: String,
	fixed: String,
});

fixSchema.index({
	'broken': 'text',
});

module.exports = mongoose.model('Fix', fixSchema);
