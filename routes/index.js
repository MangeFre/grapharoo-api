const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');

router.get('/link/next', linkController.handleNextLinkReq);

module.exports = router;