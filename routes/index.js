const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const fixController = require('../controllers/fixController');
const linkgraphController = require('../controllers/linkgraphController');
const { catchErrors } = require('../handlers/errorHandler');

router.get('/', (req, res) => {
	res.send('The api is up and running!');
});

router.post(
	'/link/next',
	linkController.normalizeUrl,
	linkController.attachLinkUrl,
	catchErrors(linkController.findInDb),
	linkController.validateLinkUrl,
	catchErrors(linkController.fetchLinkData),
	catchErrors(linkController.handleNextLink),
);

router.post(
	'/link/fix',
	fixController.validateFixRequest,
	catchErrors(fixController.checkBrokenLinkIsNotAlreadyInLinksAsValidLink),
	fixController.copyFixToUrlProperty,
	linkController.normalizeUrl,
	linkController.validateLinkUrl,
	linkController.attachLinkUrl,
	fixController.copyLinkUrlToFixProperty,
	catchErrors(fixController.checkIfFixedBefore),
	catchErrors(linkController.fetchLinkData),
	catchErrors(fixController.updateExistingLinkAndSendResponse),
);

router.get('/linkgraph', linkgraphController.getLinkgraph);

module.exports = router;
