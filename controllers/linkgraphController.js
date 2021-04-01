const mongoose = require('mongoose');
const Link = mongoose.model('Link');

exports.getLinkgraph = async (req, res) => {
	const all = await Link.find();
	res.json(all);
};
