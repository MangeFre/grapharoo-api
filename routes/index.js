const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const { catchErrors } = require('../handlers/errorHandler');

router.get('/', (req, res) => {
	res.send('The api is up and running!');
});
router.post(
	'/link/next',
	linkController.normalizeUrl,
	linkController.validateLinkUrl,
	linkController.attachLinkUrl,
	catchErrors(linkController.findInDb),
	catchErrors(linkController.fetchLinkData),
	catchErrors(linkController.handleNextLink),
);

module.exports = router;
