const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const { catchErrors } = require('../handlers/errorHandler');

router.get('/', (req, res) => {
	res.send('The api is up and running!');
});
router.get('/link/next', catchErrors(linkController.handleNextLinkReq));

module.exports = router;
