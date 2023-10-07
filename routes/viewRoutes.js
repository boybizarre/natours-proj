const express = require('express');

const router = express.Router();

const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

router.get('/', viewsController.getOverview);

router.get('/tour/:slug', authController.protect, viewsController.getTour);

router.get('/login', viewsController.getLoginForm);

module.exports = router;
