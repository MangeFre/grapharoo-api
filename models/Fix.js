const mongoose = require('mongoose');

const fixSchema = mongoose.Schema({
	link: mongoose.ObjectId,
	broken: String,
	fixed: String,
});

fixSchema.index({
	broken: 'text',
});

fixSchema.methods.exists = async (searchTerm) => {
	const exists = await this.model('Fix').findOne({
		broken: searchTerm,
	});
	
	return exists === undefined || exists === null ? false : true;
};

module.exports = mongoose.model('Fix', fixSchema);
