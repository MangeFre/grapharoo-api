const express = require('express');
const app = require('../app');
const { catchErrors } = require('../handlers/errorHandler');
const router = express.Router();


app.get('/link/next', catchErrors(linkController.handleNextLinkReq))