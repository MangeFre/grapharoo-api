const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');

router.get('/', (req, res) => {
    res.send('The api is up and running!')
})
router.get('/link/next', linkController.handleNextLinkReq);

module.exports = router;